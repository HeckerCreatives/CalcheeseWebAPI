const moment = require("moment");
const Code = require("../models/Code");
const Item = require("../models/Item");
const RobuxCode = require("../models/Robuxcode");
const Ticket  = require("../models/Ticket");
const { default: mongoose } = require("mongoose");
const { io } = require('../app');
const fs = require('fs');
const path = require('path');
const { generateRandomString, getNextCode, robuxswitchcase, ticketsswitchcase, ingameswitchcase, exclusiveswitchcase, chestswitchcase } = require("../utils/codegenerator");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const archiver = require('archiver');
const { Analytics, RedeemedCodeAnalytics } = require("../models/Analytics");
const crypto = require('crypto');
const Inventory = require("../models/Inventory");
const Player = require("../models/Player");
const { checkmaintenance } = require("../utils/maintenancetools");
const { syncAllAnalytics } = require("./dashboard");
const { syncAllAnalyticsUtility } = require("../utils/analytics");
const CodeAnalytics = require("../models/CodeAnalytics");
const { getmanufacturerbyname } = require("../utils/manufacturerutil");
const analyticsCancelMap = new Map();

const CHARSET = 'ACDEFHJKLMNPRTUVXWY379';
const CODE_LENGTH = 9;
const BATCH_SIZE = 5000;

function buildAnalyticsKey({ manufacturer, type, rarity, status, items }) {
    let key = '';
    let keys = [];
    if (manufacturer) keys.push(`M:${manufacturer}`);
    if (type) keys.push(`TY:${type}`);
    if (rarity) keys.push(`R:${rarity}`);
    if (status) keys.push(`S:${status}`);
    if (items) keys.push(`I:${items}`);
    return keys.length > 0 ? keys.join('|') : 'T'; // 'T' for total if no filter
}

function buildMultipleAnalyticsKey({ manufacturer, type, rarity, status, items }) {
    const keys = [];
    const M = manufacturer;
    const TY = type;
    const R = rarity;
    const S = status;
    const I = Array.isArray(items) ? items.map(i => i.toString()) : [];

    // LEVEL ROOT
    keys.push('T');
    // LEVEL 1
    if (M) keys.push(`M:${M}`);
    if (TY) keys.push(`TY:${TY}`);
    if (S) keys.push(`S:${S}`);
    // LEVEL 2
    if (M && TY) keys.push(`M:${M}|TY:${TY}`);
    if (S && TY) keys.push(`S:${S}|TY:${TY}`);
    if (TY && R) keys.push(`TY:${TY}|R:${R}`);
    if (TY && I.length) I.forEach(item => keys.push(`TY:${TY}|I:${item}`));
    // LEVEL 3
    if (M && TY && R) keys.push(`M:${M}|TY:${TY}|R:${R}`);
    if (TY && R && S) keys.push(`TY:${TY}|R:${R}|S:${S}`);
    if (TY && R && I.length) I.forEach(item => keys.push(`TY:${TY}|R:${R}|I:${item}`));
    // LEVEL 4
    if (M && TY && R && S) keys.push(`M:${M}|TY:${TY}|R:${R}|S:${S}`);
    if (M && TY && R && I.length) I.forEach(item => keys.push(`M:${M}|TY:${TY}|R:${R}|I:${item}`));
    // LEVEL 5
    if (M && TY && R && S && I.length) I.forEach(item => keys.push(`M:${M}|TY:${TY}|R:${R}|S:${S}|I:${item}`));

    return keys;
}

async function saveWithFallback(data, maxRetries = 3) {
    let attempts = 0;
    let currentData = [...data]; // Make a copy of the original data
    
    while (attempts < maxRetries) {
        try {
            await Code.insertMany(currentData);
            return true;
        } catch (err) {
            attempts++;
            console.log(`Insert attempt ${attempts} failed: ${err}`);
            
            if (attempts === maxRetries) {
                console.log('Max retries reached, failing...');
                throw err;
            }

            // Regenerate codes with new indices
            const highestCode = await Code.findOne().sort({ index: -1 });
            let newStartIndex = (highestCode?.index || 0) + 5000;
            console.log(`Regenerating codes starting from index: ${newStartIndex} and the highest code is ${highestCode?.index || 0}`);
            currentData = currentData.map(item => {
                const newCode = getNextCode(newStartIndex, item.length);
                newStartIndex++;
                return {
                    ...item,
                    code: newCode,
                    index: newStartIndex - 1
                };
            });
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
        }
    }
}

function generateSecureCode(length = CODE_LENGTH) {
    let code = '';
    for (let i = 0; i < length; i++) {
        const index = crypto.randomInt(0, CHARSET.length);
        code += CHARSET[index];
    }
    return code;
}

async function generateBatchUniqueCodes(desiredCount) {
    const codeSet = new Set();

    while (codeSet.size < desiredCount) {
        codeSet.add(generateSecureCode());
    }

    const batch = Array.from(codeSet);
    const existing = await Code.find({ code: { $in: batch } }).select('code');
    const existingCodes = new Set(existing.map(e => e.code));

    return batch.filter(c => !existingCodes.has(c));
}

async function handleCodeGeneration(data) {
    const { socketid, expiration, codeamount, items, type, length = CODE_LENGTH, rarity , manufacturer} = data;

    try {
        io.emit('generate-progress', { percentage: 10, status: 'Generating code patterns...' });

        const codes = [];
        const highestIndexCode = await Code.findOne().sort({ index: -1 });
        const totalCodes = highestIndexCode ? highestIndexCode.index : 0;
        let lastCodeIndex = totalCodes + 1;

        let tempbatch = 1;
        for (let batchStart = 0; batchStart < codeamount; batchStart += BATCH_SIZE) {
            const batchEnd = Math.min(batchStart + BATCH_SIZE, codeamount);
            const batchSize = batchEnd - batchStart;
            const newCodes = await generateBatchUniqueCodes(batchSize);

            const batchData = newCodes.map((code, i) => ({
                expiration,
                code,
                items,
                type,
                isUsed: false,
                index: lastCodeIndex + batchStart + i,
                length,
                rarity
            }));

            const percentage = Math.round(((batchEnd) / codeamount) * 40) + 50;
            io.emit('generate-progress', {
                percentage,
                status: `Saving In-Game codes for batch ${tempbatch}. Progress: ${batchEnd.toLocaleString()}/${codeamount.toLocaleString()}`
            });

            await saveWithFallback(batchData);

            const keysToUpdate = buildMultipleAnalyticsKey({
                manufacturer: manufacturer,
                type,
                rarity,
                status: "to-claim",
                items
            });
            keysToUpdate.push("T"); // Always include the global total key

            const incObj = {};
            keysToUpdate.forEach(key => {
                incObj[`counts.${key}`] = codesBatch.length;
            });

            for (const key of keysToUpdate) {
                await Analytics.findOneAndUpdate(
                    { name: key },
                    { $inc: { amount: codesBatch.length } },
                    { upsert: true }
                );
            }
            await CodeAnalytics.findOneAndUpdate(
                {},
                { $inc: incObj },
                { upsert: true }
            );
            tempbatch++;
        }

        io.to(socketid).emit('generate-progress', { percentage: 100, status: 'Complete', success: true });

    } catch (err) {
        console.error(`Transaction error code: ${err}`);
        io.to(socketid).emit('generate-progress', { percentage: 100, status: 'failed', success: false });
    }
}


exports.newgeneratecode = async (req, res) => {
    const { socketid, expiration, codeamount, items, type, length, rarity, manufacturer } = req.body;

    if (!expiration || !codeamount || !items) {
        return res.status(400).json({ message: "failed", data: "Please fill in all the required fields!" });
    }

    if (codeamount <= 0) {
        return res.status(400).json({ message: "failed", data: "Please enter a valid code amount!" });
    }
    if (!rarity || !["common", "uncommon", "rare", "epic", "legendary"].includes(rarity)) {
        return res.status(400).json({ message: "failed", data: "Please select a valid rarity!" });
    }

    const checkmainte = await checkmaintenance("generate");
    if (checkmainte === "maintenance") {
        return res.status(400).json({ message: "maintenance", data: "Code generation is currently under maintenance. Please try again later." });
    }

    try {
        
        setImmediate(() => handleCodeGeneration(req.body, socketid));

        res.json({ message: "success" });
    } catch (err) {
        return res.status(400).json({ 
            message: "bad-request", 
            data: "There's a problem with the server! Please contact customer support for more details." 
        });
    }
};

exports.getcodes = async (req, res) => {

    const { page, limit, type, rarity, item, status, search, archive, lastid, manufacturer } = req.query;
    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const filter = {};
    if (type) filter.type = type;
    if (item) filter.items = { $in: [new mongoose.Types.ObjectId(item)] };
    if (status && ['to-generate', "to-claim", 'claimed', "approved", "expired", null].includes(status.toLowerCase())) {
        if (status.toLowerCase() === "expired") {
            filter.expiration = { $lte: new Date() };
        } else {
            filter.status = status.toLowerCase();
        }
    }
    if (rarity && ["common", "uncommon", "rare", "epic", "legendary"].includes(rarity)) {
        filter.rarity = rarity;
    }
        if (archive === 'true' || archive === true) {
            filter.archived = true;
        } else {
            filter.archived = { $in: [false, undefined] };
        }

    if (search) {
        const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
        filter.$or = [
            { code: searchRegex },
        ];
    }
    if (manufacturer) {
        filter.manufacturer = manufacturer;
    }
    
    let lastidindex = page * pageOptions.limit;
    
    if (lastidindex) {
        filter.index = { $gt: lastidindex };
    }
    let totalDocs = 0;
    const codes = await Code.aggregate([
        {
            $match: filter,
        },
        {
            $lookup: {
                from: "items",
                localField: "items",
                foreignField: "_id",
                as: "items",
            },
        },
        {
            $lookup: {
                from: "tickets",
                localField: "ticket",
                foreignField: "_id",
                as: "ticket",
            },
        },
        {
            $unwind: { path: "$ticket", preserveNullAndEmptyArrays: true },
        },
        {
            $limit: pageOptions.limit,
        },
        {
            $sort: { _id: 1 }
        }
    ])
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the codes. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
    
    // test if codes with status claimed is empty

    const finalData = codes.map(code => {
        const result = {
            id: code._id,
            code: code.code,
            status: code.status,
            index: code.index,
            manufacturer: code.manufacturer,
            items: code.items.map(item => ({
                id: item._id,
                itemid: item.itemid,
                itemname: item.itemname,
                quantity: item?.quantity || 0,
                rarity: item.rarity || "none",
            })),
            expiration: moment(code.expiration).format("YYYY-MM-DD"),
            type: code.type,
            isUsed: code.isUsed,
            claimdate: code.updatedAt,
            archived: code.archived || false,
        };

        if (code.ticket && code.ticket._id) {
            result.ticket = {
                id: code.ticket._id,
                ticketid: code.ticket.ticketid,
            };
        }

        if (code.isUsed && code.type === "ticket") {
            result.form = {
                guardian: code.guardian,
                name: code.name,
                email: code.email,
                contact: code.contact,
                address: code.address,
                picture: code.picture,
            }
        }

        if (code.isUsed && code.type === "robux") {
            result.form = {
                name: code.name,
                email: code.email,
            }
        }

        return result;
    });

    let analyticsKey = buildAnalyticsKey({
        manufacturer: filter.manufacturer, 
        type: filter.type,
        rarity: filter.rarity,
        status: filter.status,
        // first item in items array if exists
        items: item
    });

    const analyticsDoc = await Analytics.findOne({ name: analyticsKey }).lean();
    if (analyticsDoc) {
        totalDocs = analyticsDoc.amount || 0;
    } else {
        totalDocs = await Code.countDocuments(filter);
    }

    const totalPages = Math.ceil(totalDocs / pageOptions.limit);

    const lastcodeid = codes[codes.length - 1]?.index || 0;

    return res.json({
        message: "success",
        data: finalData,
        totalPages,
        totalDocs,
        lastcodeid
    });
}
  




exports.getcodescount = async (req, res) => {
    const { socketid, page, limit, type, rarity, item, status, search, archive, lastid, manufacturer } = req.query;
    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    // Immediately respond to avoid timeout
    res.json({ message: "success", status: "count-started" });

    // Start background processing
    (async () => {
        const filter = {};
        if (type) filter.type = type;
        if (item) filter.items = { $in: [new mongoose.Types.ObjectId(item)] };
        if (status && ['to-generate', "to-claim", 'claimed', "approved", "expired", null].includes(status.toLowerCase())) {
            if (status.toLowerCase() === "expired") {
                filter.expiration = { $lte: new Date() };
            } else {
                filter.status = status.toLowerCase();
            }
        }
        if (rarity && ["common", "uncommon", "rare", "epic", "legendary"].includes(rarity)) {
            filter.rarity = rarity;
        }
        if (archive === 'true' || archive === true) {
            filter.archived = true;
        } else {
            filter.archived = { $in: [false, undefined] };
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [{ code: searchRegex }];
        }

        if (manufacturer) {
            filter.manufacturer = manufacturer;
        }

        let lastidindex = page * pageOptions.limit;
        if (lastidindex) {
            filter.index = { $gt: lastidindex };
        }

        try {

            if (socketid) {
                io.to(socketid).emit('generate-progress', {
                    percentage: 0,
                    status: 'In Progress',
                    success: false
                });
            }
            const totalCodes = await Code.countDocuments(filter);
            const totalPages = Math.ceil(totalCodes / pageOptions.limit);
            if (socketid) {
                io.to(socketid).emit('generate-progress', {
                    percentage: 100,
                    status: 'Complete',
                    success: true,
                    totalpages: totalPages,
                    totalcodes: totalCodes
                });
            }

        } catch (err) {
            console.log(`There's a problem getting the codes count. Error ${err}`);
            if (socketid) {
                io.to(socketid).emit('generate-progress', {
                    percentage: 100,
                    status: 'Failed',
                    success: false,
                    error: "There's a problem with the server! Please contact customer support for more details."
                });
            }
        }
    })();
}

exports.checkcode = async (req, res) => {
   const { id } = req.user
  const { code, username } = req.body;
    const allowedChars = /^[ACDEFHJKLMNPRTUVXWY379]+$/;

    if (!code || typeof code !== 'string' || !allowedChars.test(code.toUpperCase()) || code.length < 7 || code.length > 12) {
        return res.status(400).json({
            message: "bad-request",
            data: "Please provide a valid code! It should be 7-12 characters long and contain only letters and numbers.",
        });
    }
  if (!code)
    return res.status(400).json({
      message: "bad-request",
      data: "Please provide a code!",
    });

  try {
    const codeExists = await Code.findOne({ code: code.toUpperCase() })
      .populate('items')

    if (!codeExists)
      return res.status(400).json({
        message: "bad-request",
        data: "Code does not exist!",
      });


    if (codeExists.isUsed)
      return res.status(400).json({
        message: "bad-request",
        data: "Code has already been redeemed!",
      });

    if (codeExists.expiration < new Date())
      return res.status(400).json({
        message: "bad-request",
        data: "Code has expired!",
      });

    if (codeExists.status === "claimed" || codeExists.status === "approved" || codeExists.status === "pre-claimed" || codeExists.status === "rejected") 
      return res.status(400).json({
        message: "bad-request",
        data: "Code has already been redeemed!",
      });

    if (codeExists.status === "to-generate")
      return res.status(400).json({
        message: "bad-request",
        data: "Code is not available!",
      });

    if (codeExists.archived === true) {
        return res.status(400).json({
            message: "bad-request",
            data: "Code is archived and cannot be redeemed!",
        });
    }

    if (codeExists.type === 'exclusive' || codeExists.type === 'ingame' || codeExists.type === 'chest') {
      if (!username)
        return res.status(400).json({
          message: "bad-request",
          data: "Please provide a username!",
        });
        codeExists.name = username;
        codeExists.isUsed = true;
        codeExists.status = "claimed";
        
        const prevStatus = codeExists.status === "pre-claimed" ? "pre-claimed" : "to-claim";
        // Get all keys for previous status (to decrement)
        const prevKeys = buildMultipleAnalyticsKey({
            manufacturer: codeExists.manufacturer,
            type: codeExists.type,
            rarity: codeExists.rarity,
            status: prevStatus,
            items: codeExists.items
        });
        prevKeys.push("T");

        // Get all keys for new status (to increment)
        const newKeys = buildMultipleAnalyticsKey({
            manufacturer: codeExists.manufacturer,
            type: codeExists.type,
            rarity: codeExists.rarity,
            status: "claimed",
            items: codeExists.items
        });
        newKeys.push("T");

        const incObj = {};
        prevKeys.forEach(key => {
            incObj[`counts.${key}`] = -1;
        });
        newKeys.forEach(key => {
            incObj[`counts.${key}`] = (incObj[`counts.${key}`] || 0) + 1;
        });

        for (const key of prevKeys) {
            await Analytics.findOneAndUpdate(
                { name: key },
                { $inc: { amount: -1 } },
                { upsert: true }
            );
        }
        for (const key of newKeys) {
            await Analytics.findOneAndUpdate(
                { name: key },
                { $inc: { amount: 1 } },
                { upsert: true }
            );
        }

        await CodeAnalytics.findOneAndUpdate({}, { $inc: incObj }, { upsert: true });

        await RedeemedCodeAnalytics.create({
            code: codeExists._id,
        })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the redeemed code analytics. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
    } else if (codeExists.type === 'robux' || codeExists.type === 'ticket') {
        codeExists.status = "pre-claimed"  

        const prevStatus = codeExists.status === "pre-claimed" ? "pre-claimed" : "to-claim";

        const prevKeys = buildMultipleAnalyticsKey({
            manufacturer: codeExists.manufacturer,
            type: codeExists.type,
            rarity: codeExists.rarity,
            status: prevStatus,
            items: codeExists.items
        });

        const newKeys = buildMultipleAnalyticsKey({
            manufacturer: codeExists.manufacturer,
            type: codeExists.type,
            rarity: codeExists.rarity,
            status: "claimed", // or your new status
            items: codeExists.items
        });

        // Always include the global total key
        prevKeys.push("T");
        newKeys.push("T");

        const incObj = {};
        prevKeys.forEach(key => {
            incObj[`counts.${key}`] = -1;
        });
        newKeys.forEach(key => {
            incObj[`counts.${key}`] = (incObj[`counts.${key}`] || 0) + 1;
        });

        for (const key of prevKeys) {
            await Analytics.findOneAndUpdate(
                { name: key },
                { $inc: { amount: -1 } },
                { upsert: true }
            );
        }
        for (const key of newKeys) {
            await Analytics.findOneAndUpdate(
                { name: key },
                { $inc: { amount: 1 } },
                { upsert: true }
            );
        }

        await CodeAnalytics.findOneAndUpdate({}, { $inc: incObj }, { upsert: true });
    }

    await Inventory.create({
        owner: id,
        type: codeExists.type,
        items: codeExists.items,
        rarity: codeExists.rarity,
        code: codeExists.code,
    })
    .then(data => data)
    .catch(err => {
        console.error(`Error creating inventory: ${err}`);
        return res.status(500).json({
            message: "bad-request",
            data: "There's a problem with the server! Please contact customer support.",
        });
    });
    await codeExists.save();
    
    return res.json({
      message: "success",
      data: {
        code: codeExists.code,
        type: codeExists.type,
        rarity: codeExists.rarity,
        items: codeExists.items.map(item => ({
            id: item._id,
            itemid: item.itemid,
            itemname: item.itemname,
            quantity: item.quantity || 0,
            rarity: item.rarity || "none",
            })),
      },
    });

  } catch (err) {
    console.error(`Error checking code: ${err}`);
    return res.status(500).json({
      message: "server-error",
      data: "There's a problem with the server! Please contact customer support.",
    });
  }
};

exports.redeemcode = async (req, res) => {

    const { code, guardian, email, contact, address, robloxid, type } = req.body;
    const picture = req.file ? req.file.filename : undefined;

    if (!code) return res.status(400).json({ message: "bad-request", data: "Please provide a code!" });
    if (!robloxid) return res.status(400).json({ message: "bad-request", data: "Please provide your Roblox ID!" });

    const findPlayer = await Player.findOne({ playerid: robloxid })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem checking the player. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
    if (!findPlayer) return res.status(400).json({ message: "bad-request", data: "Player does not exist!" });
    
    // check player inventory
    const playerInventory = await Inventory.findOne({ owner: findPlayer._id, code: code })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem checking the player inventory. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!playerInventory) return res.status(400).json({ message: "bad-request", data: "You don't have this code in your inventory!" });
    
    const codeExists = await Code.findOne({ code: code })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem checking the code. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!codeExists) return res.status(400).json({ message: "bad-request", data: "Code does not exist!" });
    if (codeExists.isUsed) return res.status(400).json({ message: "bad-request", data: "Code has already been redeemed!" });
    if (codeExists.archived === true) {
        return res.status(400).json({
            message: "bad-request",
            data: "Code is archived and cannot be redeemed!",
        });
    }

    if (codeExists.type !== type) {
        return res.status(400).json({ message: "bad-request", data: "Code type does not match!" });
    }
    // robux redeem code
    if (codeExists.type === "robux") {
        
        if (!robloxid || !email) return res.status(400).json({ message: "bad-request", data: "Please fill in all the required fields!" });
        if (codeExists.status !== "pre-claimed") return res.status(400).json({ message: "bad-request", data: "Ticket is not available!" });
        // save details to code
        codeExists.name = robloxid;
        codeExists.email = email;
        codeExists.isUsed = true;
        codeExists.status = "claimed";

        await codeExists.save();

        const prevStatus = codeExists.status === "pre-claimed" ? "pre-claimed" : "to-claim";

        const prevKeys = buildMultipleAnalyticsKey({
            manufacturer: codeExists.manufacturer,
            type: codeExists.type,
            rarity: codeExists.rarity,
            status: prevStatus,
            items: codeExists.items
        });

        const newKeys = buildMultipleAnalyticsKey({
            manufacturer: codeExists.manufacturer,
            type: codeExists.type,
            rarity: codeExists.rarity,
            status: "claimed", // or your new status
            items: codeExists.items
        });

        // Always include the global total key
        prevKeys.push("T");
        newKeys.push("T");

        const incObj = {};
        prevKeys.forEach(key => {
            incObj[`counts.${key}`] = -1;
        });
        newKeys.forEach(key => {
            incObj[`counts.${key}`] = (incObj[`counts.${key}`] || 0) + 1;
        });

        for (const key of prevKeys) {
            await Analytics.findOneAndUpdate(
                { name: key },
                { $inc: { amount: -1 } },
                { upsert: true }
            );
        }
        for (const key of newKeys) {
            await Analytics.findOneAndUpdate(
                { name: key },
                { $inc: { amount: 1 } },
                { upsert: true }
            );
        }

        await CodeAnalytics.findOneAndUpdate({}, { $inc: incObj }, { upsert: true });

        await RedeemedCodeAnalytics.create({
            code: codeExists._id,
        })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the redeemed code analytics. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
         return res.json({
            message: "success",
            data: {
                code: codeExists.code,
                type: codeExists.type,
            }
        }) 
        
    } else 
    // ticket redeem code
    if (codeExists.type === "ticket") {
        if (!guardian || !contact || !address || !robloxid || !email || !picture) return res.status(400).json({ message: "bad-request", data: "Please fill in all the required fields!" });

        if (codeExists.status !== "pre-claimed") return res.status(400).json({ message: "bad-request", data: "Ticket is not available!" });

        // save details to code
        codeExists.name = robloxid;
        codeExists.email = email;
        codeExists.contact = contact;
        codeExists.address = address;
        codeExists.guardian = guardian;
        codeExists.picture = picture;
        codeExists.isUsed = true;
        codeExists.status = "claimed";

        await codeExists.save();

        const prevStatus = codeExists.status === "pre-claimed" ? "pre-claimed" : "to-claim";
     
        const prevKeys = buildMultipleAnalyticsKey({
            manufacturer: codeExists.manufacturer,
            type: codeExists.type,
            rarity: codeExists.rarity,
            status: prevStatus,
            items: codeExists.items
        });

        const newKeys = buildMultipleAnalyticsKey({
            manufacturer: codeExists.manufacturer,
            type: codeExists.type,
            rarity: codeExists.rarity,
            status: "claimed", // or your new status
            items: codeExists.items
        });

        // Always include the global total key
        prevKeys.push("T");
        newKeys.push("T");

        const incObj = {};
        prevKeys.forEach(key => {
            incObj[`counts.${key}`] = -1;
        });
        newKeys.forEach(key => {
            incObj[`counts.${key}`] = (incObj[`counts.${key}`] || 0) + 1;
        });

        for (const key of prevKeys) {
            await Analytics.findOneAndUpdate(
                { name: key },
                { $inc: { amount: -1 } },
                { upsert: true }
            );
        }
        for (const key of newKeys) {
            await Analytics.findOneAndUpdate(
                { name: key },
                { $inc: { amount: 1 } },
                { upsert: true }
            );
        }
        await CodeAnalytics.findOneAndUpdate({}, { $inc: incObj }, { upsert: true });
        
        await RedeemedCodeAnalytics.create({
            code: codeExists._id,
        })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the redeemed code analytics. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

         return res.json({
            message: "success",
            data: {
                code: codeExists.code,
                type: codeExists.type,
            }
        }) 
    }
}

exports.approverejectcode = async (req, res) => {

    const { id, status } = req.body;

    if (!id || !status) return res.status(400).json({ message: "bad-request", data: "Please provide a code and status!" });
    
    const checkmainte = await checkmaintenance("edit");
    if (checkmainte === "maintenance") {
        return res.status(400).json({ message: "maintenance", data: "Approve/Reject Code is currently under maintenance. Please try again later." });
    }
    const code = await Code.findById(id)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem checking the code. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (code.status !== "claimed") return res.status(400).json({ message: "bad-request", data: "Code is not claimed!" });
    if (status !== "approved" && status !== "rejected") return res.status(400).json({ message: "bad-request", data: "Invalid status!" });

    if (status === "approved") {
        code.status = "approved";
    } else if (status === "rejected") {
        code.status = "rejected";
    }

    if (code.type === "ticket" && code.ticket) {
        const ticket = await Ticket.findById(code.ticket)
            .then(data => data)
            .catch(err => {
                console.log(`There's a problem updating the ticket status. Error ${err}`);
                return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
            });

        if (ticket) {
            ticket.status = status === "rejected" ? "rejected" : ticket.status;
            await ticket.save()
                .catch(err => {
                    console.log(`There's a problem saving the ticket status. Error ${err}`);
                    return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
                });
        }
    } else if (code.type === "robux" && code.robuxcode) {
        const robuxcode = await RobuxCode.findById(code.robuxcode)
            .then(data => data)
            .catch(err => {
                console.log(`There's a problem updating the robux code status. Error ${err}`);
                return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
            });

        if (robuxcode) {
            robuxcode.status = status === "rejected" ? "rejected" : robuxcode.status;
            await robuxcode.save()
                .catch(err => {
                    console.log(`There's a problem saving the robux code status. Error ${err}`);
                    return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
                });
        }
    }
        const prevKeys = buildMultipleAnalyticsKey({
            manufacturer: code.manufacturer,
            type: code.type,
            rarity: code.rarity,
            status: "claimed",
            items: code.items
        });

        const newKeys = buildMultipleAnalyticsKey({
            manufacturer: code.manufacturer,
            type: code.type,
            rarity: code.rarity,
            status: status, // "approved" or "rejected"
            items: code.items
        });

        prevKeys.push("T");
        newKeys.push("T");

        const incObj = {};

        prevKeys.forEach(key => {
            incObj[`counts.${key}`] = -1;
        });
        newKeys.forEach(key => {
            incObj[`counts.${key}`] = (incObj[`counts.${key}`] || 0) + 1;
        });

        for (const key of prevKeys) {
            await Analytics.findOneAndUpdate(
                { name: key },
                { $inc: { amount: -1 } },
                { upsert: true }
            );
        }
        for (const key of newKeys) {
            await Analytics.findOneAndUpdate(
                { name: key },
                { $inc: { amount: 1 } },
                { upsert: true }
            );
        }
        await CodeAnalytics.findOneAndUpdate({}, { $inc: incObj }, { upsert: true });

    
    await code.save()
       .then(data => data)
       .catch(err => {
            console.log(`There's a problem updating the code. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" })
}

exports.deletecode = async (req, res) => {
    const { ids } = req.body; // Expect array of IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            message: "bad-request",
            data: "Please provide at least one code ID!"
        });
    }

    const checkmainte = await checkmaintenance("delete");
    if (checkmainte === "maintenance") {
        return res.status(400).json({ message: "maintenance", data: "Code deletion is currently under maintenance. Please try again later." });
    }
    try {
        // Find all codes to be deleted
        const codes = await Code.find({ _id: { $in: ids } });

        if (codes.length === 0) {
            return res.status(400).json({
                message: "bad-request",
                data: "No valid codes found!"
            });
        }

        // Check if any codes are not archived
        const nonArchivedCodes = codes.filter(code => !code.archived);
        if (nonArchivedCodes.length > 0) {
            return res.status(400).json({
                message: "bad-request",
                data: "Cannot delete codes that are not archived. Please archive the codes first."
            });
        }

        for (const code of codes) {
            // Reset ticket/robux status if needed
            if (code.type === "ticket" && code.ticket) {
                await Ticket.findByIdAndUpdate(code.ticket, { status: "to-generate" });
            } else if (code.type === "robux" && code.robuxcode) {
                await RobuxCode.findByIdAndUpdate(code.robuxcode, { status: "to-generate" });
            }
        }

        // Delete all codes in one operation
        await Code.deleteMany({ _id: { $in: ids } });

        return res.json({
            message: "success",
            deletedCount: codes.length
        });

    } catch (err) {
        console.log(`Error deleting codes: ${err}`);
        return res.status(500).json({
            message: "server-error",
            data: "There was a problem deleting the codes. Please try again or contact support."
        });
    }
}

exports.exportCodesCSV = async (req, res) => {
    try {
        const { type, item, status, dateRange, start, end, socketid } = req.query;
        const CHUNK_SIZE = 500000; // Default 1 million per file

        const checkmainte = await checkmaintenance("export");
        if (checkmainte === "maintenance") {
            return res.status(400).json({ message: "maintenance", data: "Export code CSV is currently under maintenance. Please try again later." });
        }
        // Build filter
        const filter = {};
        if (type) filter.type = type;
        if (item) filter.items = { $in: [new mongoose.Types.ObjectId(item)] };
        if (status && ['to-generate', "to-claim", 'claimed', "approved", "rejected"].includes(status.toLowerCase())) {
            filter.status = status;
        }

        // Date range filter
        if (dateRange) {
            const [startDate, endDate] = dateRange.split(',');
            if (startDate && endDate) {
                filter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
        }

        // const startIndex = Math.max(parseInt(start) || 1, 1) - 1; // 0-based index
        // const endIndex = parseInt(end) || (startIndex + 10000000);
        // const limit = endIndex - startIndex;

        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)){
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Simple headers for codes only
        const headers = [
            { id: 'code', title: 'Code' },
        ];
        let batch = 0;
        let fileList = [];
        let totalExported = 0;
        const startNum = parseInt(start) || 0;
        const endNum = parseInt(end) || 0;
        const totalToExport = endNum - startNum;
        // Immediately return success to client
        res.json({ message: "success", status: "export-started" });

        // Start export in background
        (async () => {
        let batchOffset = 0;
            for (let fileNum = 1; batchOffset < (endNum - startNum); fileNum++) {
                 const currentLimit = Math.min(CHUNK_SIZE, endNum - startNum - batchOffset);
                if (currentLimit <= 0) break;

                console.log(`Exporting batch ${fileNum} with limit ${currentLimit}...`);

                const batchProgress = (batchOffset / (end - start));
                const percentage1 = Math.round(20 + (batchProgress * 30));
                io.emit('export-progress', {
                    percentage: percentage1,
                    status: `Fetching data for batch ${fileNum}...`
                });

                // FIX: skip should be (start + batchOffset)
                const codes = await Code.find(filter)
                    .select('code')
                    .sort({ index: -1 })
                    .skip(startNum + batchOffset)
                    .limit(currentLimit)
                    .lean();

                const percentage2 = Math.round(50 + (batchProgress * 30));
                io.emit('export-progress', {
                    percentage: percentage2, 
                    status: `Processing data for batch ${fileNum}...`
                });

                const csvData = codes.map(code => ({
                    code: code.code,
                }));

                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `codes_export_${timestamp}_part${fileNum}.csv`;
                const filepath = path.join(uploadsDir, filename);

                const csvWriter = createCsvWriter({
                    path: filepath,
                    header: headers
                });

                await csvWriter.writeRecords(csvData);
                totalExported += codes.length;

                const percentage3 = Math.round(80 + (batchProgress * 20));
                io.emit('export-progress', {
                    percentage: percentage3,
                    status: `Saving batch ${fileNum} (${totalExported.toLocaleString()} of ${totalToExport.toLocaleString()} codes)...`
                });

                fileList.push(filename);
                batchOffset += currentLimit;
            }
        io.emit('export-progress', {
            percentage: 100,
            status: `Creating ZIP archive with ${fileList.length} files...`
        });
            
            // Create ZIP
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const zipFilename = `codes_export_${timestamp}.zip`;
            const zipPath = path.join(uploadsDir, zipFilename);
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => {
                // Send file link via socket
                // Optionally, delete CSV files after zipping
                    io.emit('export-progress', {
                        percentage: 100,
                        status: 'complete',
                        file: `/uploads/${zipFilename}`,
                        message: 'Export complete. Click to download.'
                    });

                fileList.forEach(filename => {
                    const filePath = path.join(uploadsDir, filename);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                });
            });

            archive.pipe(output);
            fileList.forEach(filename => {
                archive.file(path.join(uploadsDir, filename), { name: filename });
            });
            archive.finalize();
        })();

    } catch (err) {
        console.log(`Error exporting codes to CSV: ${err}`);
        return res.status(500).json({ 
            message: "bad-request", 
            data: "There's a problem generating the CSV file. Please try again or contact support." 
        });
    }
};

exports.editmultiplecodes = async (req, res) => {
    const { ids, type, items, rarity, expiration, status, archive } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ 
            message: "bad-request", 
            data: "Please provide at least one code ID!" 
        });
    }

    const checkmainte = await checkmaintenance("edit");
    if (checkmainte === "maintenance") {
        return res.status(400).json({ message: "maintenance", data: "Code update is currently under maintenance. Please try again later." });
    }

    // Build update data
    const updatedata = {};
    if (type) updatedata.type = type;
    if (items && Array.isArray(items) && items.length > 0) {
        updatedata.items = items.map(item => new mongoose.Types.ObjectId(item));
    }
    if (rarity && ["common", "uncommon", "rare", "epic", "legendary"].includes(rarity)) {
        updatedata.rarity = rarity;
    } else if (rarity) {
        return res.status(400).json({ 
            message: "bad-request", 
            data: "Invalid rarity! Must be one of: common, uncommon, rare, epic, legendary." 
        });
    }
    if (expiration) updatedata.expiration = new Date(expiration);
    if (status && ['to-generate', "to-claim", 'claimed', "approved", "rejected"].includes(status.toLowerCase())) {
        updatedata.status = status.toLowerCase();
    }
    if (archive !== undefined) updatedata.archived = !!archive;

    if (type && !['robux', 'ticket', 'ingame', 'exclusive', 'chest'].includes(type.toLowerCase())) {
        return res.status(400).json({ 
            message: "bad-request", 
            data: "Invalid type! Must be one of: robux, ticket, ingame, exclusive and chest." 
        });
    }

    if (Object.keys(updatedata).length === 0) {
        return res.status(400).json({ 
            message: "bad-request", 
            data: "Please provide at least one field to update!" 
        });
    }

    // Fetch original codes for comparison
    const originalCodes = await Code.find({ _id: { $in: ids } });

    // Archive/unarchive logic
    if (archive === true) {
        // Archive: set archived=true, remove from analytics
        for (const code of originalCodes) {
            await updateAnalyticsOnArchive(code, -1); // decrement analytics
        }

    } else if (archive === false) {
        // Unarchive: set archived=false, restore to analytics
        for (const code of originalCodes) {
            await updateAnalyticsOnArchive(code, 1); // increment analytics
        }
    }

    // Status/type/rarity change logic
    if (status || type || rarity) {
        for (const code of originalCodes) {
            await updateAnalyticsOnEdit(code, updatedata);
        }
    }

    // Update codes
    await Code.updateMany(
        { _id: { $in: ids } },
        { $set: updatedata }
    );

    return res.json({ message: "success" });
};

// Helper: Update analytics on archive/unarchive
async function updateAnalyticsOnArchive(code, direction = -1) {
    // direction: -1 for archive (decrement), 1 for unarchive (increment)
    // --- Flat-keyed CodeAnalytics integration ---
    // Use buildMultipleAnalyticsKey for all keys of this code's current state
    const keys = buildMultipleAnalyticsKey({
        manufacturer: code.manufacturer,
        type: code.type,
        rarity: code.rarity,
        status: code.status,
        items: code.items
    });
    keys.push("T");

    const incObj = {};
    keys.forEach(key => {
        incObj[`counts.${key}`] = direction;
    });

    
    for (const key of keys) {
        await Analytics.findOneAndUpdate(
            { name: key },
            { $inc: { amount: direction } },
            { upsert: true }
        );
    }

    await CodeAnalytics.findOneAndUpdate({}, { $inc: incObj }, { upsert: true });
}

async function updateAnalyticsOnEdit(original, updated) {
    // --- Flat-keyed CodeAnalytics integration ---
    // Decrement all keys for previous state, increment all keys for new state
    const prevKeys = buildMultipleAnalyticsKey({
        manufacturer: original.manufacturer,
        type: original.type,
        rarity: original.rarity,
        status: original.status,
        items: original.items
    });
    prevKeys.push("T");

    const newKeys = buildMultipleAnalyticsKey({
        manufacturer: updated.manufacturer || original.manufacturer,
        type: updated.type || original.type,
        rarity: updated.rarity || original.rarity,
        status: updated.status || original.status,
        items: updated.items || original.items
    });
    newKeys.push("T");

    const incObj = {};
    prevKeys.forEach(key => {
        incObj[`counts.${key}`] = -1;
    });
    newKeys.forEach(key => {
        incObj[`counts.${key}`] = (incObj[`counts.${key}`] || 0) + 1;
    });

    for (const key of prevKeys) {
        await Analytics.findOneAndUpdate(
            { name: key },
            { $inc: { amount: -1 } },
            { upsert: true }
        );
    }
    for (const key of newKeys) {
        await Analytics.findOneAndUpdate(
            { name: key },
            { $inc: { amount: 1 } },
            { upsert: true }
        );
    }
    if (Object.keys(incObj).length > 0) {
        await CodeAnalytics.findOneAndUpdate({}, { $inc: incObj }, { upsert: true });
    }
}

exports.resetcode = async (req, res) => {
    const { id } = req.body;

    if (!id) return res.status(400).json({ message: "bad-request", data: "Please provide a code ID!" });
    const checkmainte = await checkmaintenance("edit");
    if (checkmainte === "maintenance") {
        return res.status(400).json({ message: "maintenance", data: "Reset code is currently under maintenance. Please try again later." });
    }
    const code = await Code.findById(id)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem checking the code. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!code) return res.status(400).json({ message: "bad-request", data: "Code does not exist!" });

    // Update flat-keyed analytics
    if (code.status === "claimed" || code.status === "approved" || code.status === "rejected") {
        // Decrement previous state key

        const prevKeys = buildMultipleAnalyticsKey({
            manufacturer: code.manufacturer,
            type: code.type,
            rarity: code.rarity,
            status: code.status,
            items: code.items
        });

        const newKeys = buildMultipleAnalyticsKey({
            manufacturer: code.manufacturer,
            type: code.type,
            rarity: code.rarity,
            status: "to-claim", // Resetting to "to-claim" or "to-generate"
            items: code.items
        });
        prevKeys.push("T");
        newKeys.push("T");

        const incObj = {};
        prevKeys.forEach(key => {
            incObj[`counts.${key}`] = -1;
        });
        newKeys.forEach(key => {
            incObj[`counts.${key}`] = (incObj[`counts.${key}`] || 0) + 1;
        });

        for (const key of prevKeys) {
            await Analytics.findOneAndUpdate(
                { name: key },
                { $inc: { amount: -1 } },
                { upsert: true }
            );
        }
        for (const key of newKeys) {
            await Analytics.findOneAndUpdate(
                { name: key },
                { $inc: { amount: 1 } },
                { upsert: true }
            );
        }

        await CodeAnalytics.findOneAndUpdate({}, { $inc: incObj }, { upsert: true });
    }

    code.isUsed = false;
    code.status = "to-claim"; // Reset status to "to-claim" or "to-generate" based on your logic
    code.name = null;
    code.email = null;
    code.address = null;
    code.contact = null;
    code.guardian = null;
    code.picture = null;

    await code.save()
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem resetting the code. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({
        message: "success",
        data: {
            id: code._id,
            type: code.type,
            status: code.status,
        }
    });
}


exports.generateitemsoncode = async (req, res, next) => {

    const { manufacturer, type, rarity, itemid, codesamount, socketid } = req.body;

    if (!manufacturer || !type || !rarity || !itemid || !codesamount) {
        return res.status(400).json({ message: "bad-request", data: "Please provide all required fields!" });
    }

    if (!['robux', 'ticket', 'ingame', 'exclusive', 'chest'].includes(type.toLowerCase())) {
        return res.status(400).json({ message: "bad-request", data: "Invalid type! Must be one of: robux, ticket, ingame, exclusive and chest." });
    }
    if (!['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(rarity.toLowerCase())) {
        return res.status(400).json({ message: "bad-request", data: "Invalid rarity! Must be one of: common, uncommon, rare, epic, legendary." });
    }
    if (codesamount <= 0) {
        return res.status(400).json({ message: "bad-request", data: "codes amount must be greater than 0!" });
    }
    if (!mongoose.Types.ObjectId.isValid(itemid)) {
        return res.status(400).json({ message: "bad-request", data: "Invalid item ID!" });
    }

    // Return success immediately to avoid timeout
    res.json({ message: "success", status: "generation-started" });

// Start background processing
(async () => {
    const batchSize = 1000;
    let processed = 0;
    let batchNum = 1;
    let totalUpdated = 0;

    try {
        let itemDocs = Array.isArray(itemid)
            ? await Item.find({ _id: { $in: itemid } })
            : [await Item.findById(itemid)];

        if (!itemDocs || itemDocs.length === 0) {
            io.to(socketid).emit('generate-items-progress', {
                percentage: 100,
                status: 'failed',
                message: "Item does not exist!",
                success: false
            });
            return;
        }

        const itemIds = itemDocs.map(item => item._id);

        while (processed < codesamount) {
            const remaining = codesamount - processed;
            const currentBatchSize = Math.min(batchSize, remaining);

            io.to(socketid).emit('generate-items-progress', {
                percentage: Math.round((processed / codesamount) * 100),
                status: `Processing batch ${batchNum} (${processed}/${codesamount}).`
            });

            const codesBatch = await Code.find({ 
                manufacturer: manufacturer,
                items: { $size: 0 } 
            })
            .select('_id index type rarity status')
            .limit(currentBatchSize);

            if (codesBatch.length === 0) {
                console.log(`No more codes available for batch ${batchNum}.`);
                break;
            }

            for (const code of codesBatch) {
                if (code.type === "chest") {
                    const decObj = {};
                    const keyManuType = buildAnalyticsKey({ manufacturer: manufacturer, type: "chest" });
                    const keyTypeOnly = buildAnalyticsKey({ type: "chest" });
                    decObj[`counts.${keyManuType}`] = -1;
                    decObj[`counts.${keyTypeOnly}`] = -1;
                    decObj[`counts.M:${manufacturer}`] = -1;
                    await CodeAnalytics.findOneAndUpdate({}, { $inc: decObj }, { upsert: true });
                }

                if (code.type === "chest") {
                    // Build analytics keys
                    const keyManuType = buildAnalyticsKey({ manufacturer: manufacturer, type: "chest" });
                    const keyTypeOnly = buildAnalyticsKey({ type: "chest" });
                    const keyManufacturer = `M:${manufacturer}`;

                    // Decrement each key in Analytics
                    await Analytics.findOneAndUpdate(
                        { name: keyManuType },
                        { $inc: { amount: -1 } },
                        { upsert: true }
                    );
                    await Analytics.findOneAndUpdate(
                        { name: keyTypeOnly },
                        { $inc: { amount: -1 } },
                        { upsert: true }
                    );
                    await Analytics.findOneAndUpdate(
                        { name: keyManufacturer },
                        { $inc: { amount: -1 } },
                        { upsert: true }
                    );
                }

            }
            io.to(socketid).emit('generate-items-progress', {
                percentage: Math.round((processed / codesamount) * 100),
                status: `Processing batch ${batchNum} (${processed}/${codesamount})..`
            });
            await Code.updateMany(
                { _id: { $in: codesBatch.map(code => code._id) } },
                {
                    $set: {
                        items: itemIds,
                        status: "to-claim",
                        type: type,
                        rarity: rarity
                    }
                }
            );

            totalUpdated += codesBatch.length;
            processed += codesBatch.length;

            io.to(socketid).emit('generate-items-progress', {
                percentage: Math.round((processed / codesamount) * 100),
                status: `Processing batch ${batchNum} (${processed}/${codesamount})...`,
                processed,
                total: codesamount,
                success: true
            });

            console.log(`Processed batch ${batchNum}: ${codesBatch.length} codes, total processed: ${processed}`);
            batchNum++;
        }

        if (totalUpdated > 0) {
            const keysToUpdate = buildMultipleAnalyticsKey({
                manufacturer: manufacturer,
                type,
                rarity,
                status: "to-claim",
                items: itemIds
            });
            keysToUpdate.push("T");

            const incObj = {};
            keysToUpdate.forEach(key => {
                incObj[`counts.${key}`] = totalUpdated;
            });

            for (const key of keysToUpdate) {
                await Analytics.findOneAndUpdate(
                    { name: key },
                    { $inc: { amount: totalUpdated } },
                    { upsert: true }
                );
            }
            console.log(`Final analytics update with ${totalUpdated} items...`);
            await CodeAnalytics.findOneAndUpdate({}, { $inc: incObj }, { upsert: true });
        }
        io.to(socketid).emit('generate-items-progress', {
            percentage: 100,
            status: 'Complete',
            processed,
            type,
            rarity,
            manufacturer: manufacturer,
            success: true
        });

    } catch (error) {
        console.error(`Error generating items on codes: ${error.message}`);
        io.to(socketid).emit('generate-items-progress', {
            percentage: 100,
            status: 'failed',
            message: error.message,
            success: false
        });
    }
})();

};
// Helper to build manufacturer _id filter
function getManufacturerFilter(manufacturer) {
  const manufact = getmanufacturerbyname(manufacturer);
  if (manufact !== null) {
    const gtIndex = manufact.gt || null;
    const lteIndex = manufact.lte || 0;
    return { _id: { $lte: lteIndex, ...(gtIndex && { $gt: gtIndex }) } };
  }
  return {};
}

// 🔹 Fetch total code count for the manufacturer
async function getTotalCodesForManufacturer(filter, socketid) {
  const total = await Code.countDocuments(filter);
  if (analyticsCancelMap.get(socketid)) {
    if (!getTotalCodesForManufacturer._cancelled) {
      io.to(socketid).emit('code-analytics-progress', {
        percentage: 100,
        status: 'cancelled',
        message: 'Analytics generation cancelled by user.'
      });
      getTotalCodesForManufacturer._cancelled = true;
    }
    analyticsCancelMap.delete(socketid);
    return undefined;
  }
  return total;
}

// 🔹 Fetch analytics for each item in parallel
async function getItemsAnalytics(filter, socketid) {
  const items = await Item.find({});
  const analytics = await Promise.all(
    items.map(async (item) => {
      const itemId = new mongoose.Types.ObjectId(item._id);
      const itemFilter = {
        ...filter,
        items: { $in: [itemId] },
      };

      if (analyticsCancelMap.get(socketid)) {
        if (!getItemsAnalytics._cancelled) {
          io.to(socketid).emit('code-analytics-progress', {
            percentage: 100,
            status: 'cancelled',
            message: 'Analytics generation cancelled by user.'
          });
          getItemsAnalytics._cancelled = true;
        }
        analyticsCancelMap.delete(socketid);
        return undefined;
      }

      const result = await Code.aggregate([
        { $match: itemFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            claimed: {
              $sum: { $cond: [{ $eq: ['$status', 'claimed'] }, 1, 0] },
            },
            unclaimed: {
              $sum: { $cond: [{ $eq: ['$status', 'to-claim'] }, 1, 0] },
            },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
            },
          },
        },
      ]);

      const stats = result[0] || {
        total: 0,
        claimed: 0,
        unclaimed: 0,
        approved: 0,
        rejected: 0,
      };

      return {
        itemname: item.itemname,
        itemtype: item.category,
        itemrarity: item.rarity,
        totalcodes: stats.total,
        claimed: stats.claimed,
        unclaimed: stats.unclaimed,
        approved: stats.approved,
        rejected: stats.rejected,
      };
    })
  );

  return analytics.filter(Boolean); // Remove undefined if cancelled
}

// 🔹 Main handler function
exports.getCodeAnalyticsCountOverall = async (req, res) => {
  const { manufacturer, socketid } = req.query;
  const filter = manufacturer ? getManufacturerFilter(manufacturer) : {};
  res.json({
    message: "success",
    status: "analytics-started",
  });
  (async () => {
    try {
      const [totalcodes, itemsanalytics] = await Promise.all([
        getTotalCodesForManufacturer(filter, socketid),
        getItemsAnalytics(filter, socketid),
      ]);
      if (analyticsCancelMap.get(socketid)) {
        // Already handled in subfunctions, just ensure cleanup
        analyticsCancelMap.delete(socketid);
        return;
      }
      io.to(socketid).emit('code-analytics-progress', {
        percentage: 100,
        status: 'complete',
        manufacturer: manufacturer || '',
        totalcodes,
        itemsanalytics,
        message: 'Analytics data generated successfully.',
      });
      analyticsCancelMap.delete(socketid);
    } catch (err) {
      console.error('Error in getCodeAnalyticsCountOverall:', err);
      io.to(socketid).emit('code-analytics-progress', {
        percentage: 100,
        status: 'failed',
        message: 'There was an error generating the analytics data. Please try again later.',
      });
      analyticsCancelMap.delete(socketid);
    }
  })();
};


exports.cancelAnalytics = (req, res) => {
    const { socketid } = req.body;
    if (!socketid) {
        return res.status(400).json({ message: "bad-request", data: "Missing socketid" });
    }
    analyticsCancelMap.set(socketid, true);
    return res.json({ message: "cancelled" });
};