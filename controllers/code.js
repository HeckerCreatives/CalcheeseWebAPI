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

const CHARSET = 'ACDEFHJKLMNPRTUVXWY379';
const CODE_LENGTH = 9;
const BATCH_SIZE = 5000;

exports.newgeneratecode = async (req, res) => {
    const { socketid, expiration, codeamount, items, type, length, rarity } = req.body;

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
    const { socketid, expiration, codeamount, items, type, length = CODE_LENGTH, rarity } = data;

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

            const analyticsUpdate = { $inc: { totaltoclaim: batchData.length } };
            if (type === 'ingame') ingameswitchcase(rarity, batchData.length, analyticsUpdate);
            else if (type === 'exclusive') exclusiveswitchcase(rarity, batchData.length, analyticsUpdate);
            else if (type === 'chest') chestswitchcase(rarity, batchData.length, analyticsUpdate);
            else if (type === 'robux') robuxswitchcase(rarity, batchData.length, analyticsUpdate);
            else if (type === 'ticket') ticketsswitchcase(rarity, batchData.length, analyticsUpdate);

            await Analytics.findOneAndUpdate({}, analyticsUpdate, { new: true });
            tempbatch++;
        }

        io.to(socketid).emit('generate-progress', { percentage: 100, status: 'Complete', success: true });

    } catch (err) {
        console.error(`Transaction error code: ${err}`);
        io.to(socketid).emit('generate-progress', { percentage: 100, status: 'failed', success: false });
    }
}

// async function handleCodeGeneration(data) {
//     const { socketid, expiration, codeamount, items, type, length, rarity } = data;

//     console.log("socketid", socketid)
//     console.log("expiration", expiration)
//     console.log("codeamount", codeamount)
//     console.log("items", items)
//     console.log("type", type)
//     console.log("length", length)
//     console.log("rarity", rarity)
//     console.log("STARTING CODE GENERATION")

//     console.log("SOCKET WILL SEND FIRST STATUS")

//     io.emit('generate-progress', { 
//         percentage: 0,
//         status: 'Starting code generation...'
//     });

//     try{
//         io.emit('generate-progress', { 
//             percentage: 10,
//             status: 'Generating code patterns...'
//         });

//         console.log("CODE LOGIC")

//         const codes = [];
//         const highestIndexCode = await Code.findOne().sort({ index: -1 });
//         const totalCodes = highestIndexCode ? highestIndexCode.index : 0;

//         let lastCode = (totalCodes || 0) + 1;
//         let currentCode = lastCode;

//         console.log(`Last code index: ${lastCode}`);
//         io.to(socketid).emit('generate-progress', { 
//             percentage: 40,
//             status: `Preparing to save codes...`
//         });

//         let codeData = [];

//         let tempbatch = 1
//          if (type === "ticket") {
//             for (let i = 0; i < codeamount; i++) {
//                     currentCode = getNextCode(lastCode + i, length || 9);
//                     codes.push(currentCode);

//                     if (i % Math.max(1, Math.floor(codeamount / 10)) === 0) {
//                         const percentage = Math.round((i / codeamount) * 80) + 10;
//                         io.emit('generate-progress', { 
//                             percentage,
//                             status: `Generating code patterns... ${i}/${codeamount}`
//                         });
//                     }
//                 }

//                 const availableTickets = await Ticket.find({ status: "to-generate" })
//                 if (!availableTickets || availableTickets.length === 0) {
//                     io.emit('generate-progress', { 
//                         percentage: 100,
//                         status: 'failed',
//                         success: false
//                     });
//                     return                 
//                 }

//                 if (codeamount > availableTickets.length) {
//                     io.emit('generate-progress', { 
//                         percentage: 100,
//                         status: 'failed',
//                         success: false
//                     });
//                     return                 
//                 }

//                 for (let i = 0; i < codeamount; i++) {
//                     const ticketDoc = availableTickets[i];
//                     ticketDoc.status = "to-claim";
//                     await ticketDoc.save();

//                     codeData.push({
//                         expiration: expiration,
//                         code: codes[i],
//                         items: items,
//                         ticket: ticketDoc._id,
//                         type: "ticket",
//                         isUsed: false,
//                         index: lastCode + i + 1,
//                         length: length || 9,
//                         rarity: rarity
//                     });
//                 }
//         } else if (type === "ingame" || type === "exclusive" || type === "chest" || type === "robux") {
//             const BATCH_SIZE = 5000; // Reduced batch size
//             let startIndex = (lastCode || 0);
            
//             for (let batchStart = 0; batchStart < codeamount; batchStart += BATCH_SIZE) {
//                 // Start a new transaction for each batch

//                 try {
//                     const batchEnd = Math.min(batchStart + BATCH_SIZE, codeamount);
//                     const batchData = [];

//                     const percentage = Math.round(((batchEnd) / codeamount) * 40) + 50;
//                     io.emit('generate-progress', {
//                         percentage,
//                         status: `Generating code for batch ${tempbatch}. Progress: ${batchEnd.toLocaleString()}/${codeamount.toLocaleString()}`
//                     });
                    
//                     for (let i = 0; i < (batchEnd - batchStart); i++) {
//                         const currentIndex = startIndex + batchStart + i;
//                         const currentCode = getNextCode(currentIndex, length || 9);
//                         batchData.push({
//                             expiration: expiration,
//                             code: currentCode,
//                             items: items,
//                             type: type,
//                             isUsed: false,
//                             index: currentIndex,
//                             length: length || 9,
//                             rarity: rarity
//                         });
//                     }
                    


//                     io.emit('generate-progress', {
//                         percentage,
//                         status: `Saving In-Game codes for batch ${tempbatch}. Progress: ${batchEnd.toLocaleString()}/${codeamount.toLocaleString()}`
//                     });
                    
//                     // Replace the original line with:
//                     await saveWithFallback(batchData);
//                     const analyticsUpdate = { 
//                         $inc: { 
//                             totaltoclaim: batchData.length 
//                         }
//                     };

//                     // Count codes by type and rarity
//                         if (type === 'ingame') {
//                             ingameswitchcase(rarity, BATCH_SIZE, analyticsUpdate);
//                         } else if (type === 'exclusive') {
//                             exclusiveswitchcase(rarity, BATCH_SIZE, analyticsUpdate);
//                         } else if (type === 'chest') {
//                             chestswitchcase(rarity, BATCH_SIZE, analyticsUpdate);
//                         } else if (type === 'robux') {
//                             robuxswitchcase(rarity, BATCH_SIZE, analyticsUpdate);
//                         }

//                     await Analytics.findOneAndUpdate({}, analyticsUpdate, { new: true });
//                     tempbatch++
//                 } catch (err) {
//                     throw err;
//                 } 
//             }

//         } else {
//             io.emit('generate-progress', { 
//                 percentage: 100,
//                 status: 'failed',
//                 success: false
//             });
//             return 
//         }

//         if (socketid) {
//             io.to(socketid).emit('generate-progress', { 
//                 percentage: 90,
//                 status: 'Saving codes to database...'
//             });
//         }

//         if(type === 'robux' || type === 'ticket') {

//             await saveWithFallback(codeData);

//             const update = { 
//             $inc: { 
//                 totaltoclaim: codeamount,
//                 totaltogenerate: (type === 'robux' || type === 'ticket') ? -codeamount : 0
//             }
//             };  

//             // Add rarity counts for robux codes
//             if (type === 'robux') {
//                 robuxswitchcase(rarity, codeamount, update);
//             }
//             // Add rarity counts for ticket codes
//             if (type === 'ticket') {
//                 ticketsswitchcase(rarity, codeamount, update)
//             }

//             await Analytics.findOneAndUpdate({}, update, { new: true });
//         }
        
//         if (socketid) {
//             io.to(socketid).emit('generate-progress', { 
//                 percentage: 100,
//                 status: 'Complete',
//                 success: true
//             });
//         }
//     }
//     catch(err){
//         console.log(`Transaction error code: ${err}`);
//     }
// }
// async function handleCodeGeneration(data) {
//     const { socketid, expiration, codeamount, items, type, length, rarity } = data;

//     console.log("socketid", socketid)
//     console.log("expiration", expiration)
//     console.log("codeamount", codeamount)
//     console.log("items", items)
//     console.log("type", type)
//     console.log("length", length)
//     console.log("rarity", rarity)
//     console.log("STARTING CODE GENERATION")

//     const session = await mongoose.startSession();
//     session.startTransaction();

//     console.log("SOCKET WILL SEND FIRST STATUS")

//     if (socketid) {
//         io.to(socketid).emit('generate-progress', { 
//             percentage: 0,
//             status: 'Starting code generation...'
//         });
//     }

//     try{
//         if (socketid) {
//             io.to(socketid).emit('generate-progress', { 
//                 percentage: 10,
//                 status: 'Generating code patterns...'
//             });
//         }

//         console.log("CODE LOGIC")

//         const codes = [];
//         const highestIndexCode = await Code.findOne().sort({ index: -1 }).session(session);
//         const totalCodes = highestIndexCode ? highestIndexCode.index : 0;

//         let lastCode = (totalCodes || 0) + 1;
//         let currentCode = lastCode;

//         console.log(`Last code index: ${lastCode}`);
//         if (socketid) {
//             io.to(socketid).emit('generate-progress', { 
//             percentage: 40,
//             status: `Preparing to save codes...`
//             });
//         }

//         let codeData = [];

//         let tempbatch = 1

//         if (type === "robux") {
//             for (let i = 0; i < codeamount; i++) {
//             currentCode = getNextCode(lastCode + i, length || 9);
//             codes.push(currentCode);

//             if (i % Math.max(1, Math.floor(codeamount / 10)) === 0) {
//                 const percentage = Math.round((i / codeamount) * 80) + 10;
//                 if (socketid) {
//                 io.to(socketid).emit('generate-progress', { 
//                     percentage,
//                     status: `Generating code patterns... ${i}/${codeamount}`
//                 });
//                 }
//             }
//             }
            
//             const temprobuxcodes = await RobuxCode.find({ status: "to-generate" }).session(session);
//             if (!temprobuxcodes || temprobuxcodes.length === 0) {
//             await session.abortTransaction();
//             session.endSession();
//                         if (socketid) {
//                 io.to(socketid).emit('generate-progress', { 
//                     percentage: 100,
//                     status: 'failed',
//                     success: false
//                 });
//             }
//             return 
//             }

//             if (codeamount > temprobuxcodes.length) {
//             await session.abortTransaction();
//             session.endSession();
//             if (socketid) {
//                 io.to(socketid).emit('generate-progress', { 
//                     percentage: 100,
//                     status: 'failed',
//                     success: false
//                 });
//             }
//             return             
//         }

//             for (let i = 0; i < codeamount; i++) {
//             const tempcode = temprobuxcodes[i];
//             tempcode.status = "to-claim";
//             await tempcode.save({ session });

//             codeData.push({
//                 expiration: expiration,
//                 code: codes[i],
//                 items: items,
//                 robuxcode: tempcode._id,
//                 type: "robux",
//                 isUsed: false,
//                 index: lastCode + i + 1,
//                 length: length || 9,
//                 rarity: rarity
//             });
//             }
//         } else if (type === "ticket") {
//             for (let i = 0; i < codeamount; i++) {
//                     currentCode = getNextCode(lastCode + i, length || 9);
//                     codes.push(currentCode);

//                     if (i % Math.max(1, Math.floor(codeamount / 10)) === 0) {
//                         const percentage = Math.round((i / codeamount) * 80) + 10;
//                         if (socketid) {
//                             io.to(socketid).emit('generate-progress', { 
//                                 percentage,
//                                 status: `Generating code patterns... ${i}/${codeamount}`
//                             });
//                         }
//                     }
//                 }

//                 const availableTickets = await Ticket.find({ status: "to-generate" }).session(session);
//                 if (!availableTickets || availableTickets.length === 0) {
//                     await session.abortTransaction();
//                     session.endSession();
//                 if (socketid) {
//                         io.to(socketid).emit('generate-progress', { 
//                             percentage: 100,
//                             status: 'failed',
//                             success: false
//                         });
//                     }
//                     return                 
//                 }

//                 if (codeamount > availableTickets.length) {
//                     await session.abortTransaction();
//                     session.endSession();
//                 if (socketid) {
//                         io.to(socketid).emit('generate-progress', { 
//                             percentage: 100,
//                             status: 'failed',
//                             success: false
//                         });
//                     }
//                     return                 
//                 }

//                 for (let i = 0; i < codeamount; i++) {
//                     const ticketDoc = availableTickets[i];
//                     ticketDoc.status = "to-claim";
//                     await ticketDoc.save({ session });

//                     codeData.push({
//                         expiration: expiration,
//                         code: codes[i],
//                         items: items,
//                         ticket: ticketDoc._id,
//                         type: "ticket",
//                         isUsed: false,
//                         index: lastCode + i + 1,
//                         length: length || 9,
//                         rarity: rarity
//                     });
//                 }
//         } else if (type === "ingame" || type === "exclusive" || type === "chest") {
//             const BATCH_SIZE = 20000; // Reduced batch size
//             let startIndex = (lastCode || 0);
            
//             for (let batchStart = 0; batchStart < codeamount; batchStart += BATCH_SIZE) {
//                 // Start a new transaction for each batch
//                 const batchSession = await mongoose.startSession();
//                 batchSession.startTransaction();

//                 try {
//                     const batchEnd = Math.min(batchStart + BATCH_SIZE, codeamount);
//                     const batchData = [];

//                     if (socketid) {
//                         const percentage = Math.round(((batchEnd) / codeamount) * 40) + 50;
//                         io.to(socketid).emit('generate-progress', {
//                             percentage,
//                             status: `Generating code for batch ${tempbatch}. Progress: ${batchEnd.toLocaleString()}/${codeamount.toLocaleString()}`
//                         });
//                     }
                    
//                     for (let i = 0; i < (batchEnd - batchStart); i++) {
//                         const currentIndex = startIndex + batchStart + i;
//                         const currentCode = getNextCode(currentIndex, length || 9);
//                         batchData.push({
//                             expiration: expiration,
//                             code: currentCode,
//                             items: items,
//                             type: type,
//                             isUsed: false,
//                             index: currentIndex,
//                             length: length || 9,
//                             rarity: rarity
//                         });
//                     }
                    
//                     await Code.insertMany(batchData, { session: batchSession, maxTimeMS: 60000 });
//                     await Analytics.findOneAndUpdate(
//                         {}, 
//                         { $inc: { totaltoclaim: batchData.length } }, 
//                         { session: batchSession, new: true }
//                         );
//                     await batchSession.commitTransaction();

                    

//                     if (socketid) {
//                         const percentage = Math.round(((batchEnd) / codeamount) * 40) + 50;
//                         io.to(socketid).emit('generate-progress', {
//                             percentage,
//                             status: `Saving In-Game codes for batch ${tempbatch}. Progress: ${batchEnd.toLocaleString()}/${codeamount.toLocaleString()}`
//                         });
//                     }
//                     tempbatch++
//                 } catch (err) {
//                     await batchSession.abortTransaction();
//                     throw err;
//                 } finally {
//                     batchSession.endSession();
//                 }
//             }

//         } else {
//             await session.abortTransaction();
//             session.endSession();
//             if (socketid) {
//                 io.to(socketid).emit('generate-progress', { 
//                     percentage: 100,
//                     status: 'failed',
//                     success: false
//                 });
//             }
//             return 
//         }

//         if (socketid) {
//             io.to(socketid).emit('generate-progress', { 
//                 percentage: 90,
//                 status: 'Saving codes to database...'
//             });
//         }

//         if(type === 'robux' || type === 'ticket') {
//         await Code.insertMany(codeData, { session });

//         const update = { 
//             $inc: { 
//                 totaltoclaim: codeamount,
//                 totaltogenerate: (type === 'robux' || type === 'ticket') ? -codeamount : 0
//             }
//         };  


//         await Analytics.findOneAndUpdate({}, update, { session, new: true });
//         }
//         await session.commitTransaction();
//         session.endSession();
        
//         if (socketid) {
//             io.to(socketid).emit('generate-progress', { 
//                 percentage: 100,
//                 status: 'Complete',
//                 success: true
//             });
//         }
//     }
//     catch(err){
//         console.log(`Transaction error code: ${err}`);
//     }
// }

exports.getcodes = async (req, res) => {

    const { page, limit, type, rarity, item, status, search, archive } = req.query;
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

    console.log("Filter:", filter);
    if (search) {
        const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
        filter.$or = [
            { code: searchRegex },
            // { "items.itemname": searchRegex },
            { "robuxcode.robuxcode": searchRegex },
            { "ticket.ticketid": searchRegex }
        ];
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
            $skip: pageOptions.page * pageOptions.limit,
        },
        {
            $limit: pageOptions.limit,
        },
        {
            $sort: { index: -1 }
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

        
    const AnalyticsData = await Analytics.findOne({})
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the analytics data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (filter.archived === true) {
        totalDocs = AnalyticsData.totalarchived || 0;
        console.log('Using archived total:', totalDocs);
    } else if (filter.type) {
                switch(filter.type) {
                    case 'ingame':
                        console.log('Checking ingame codes...');
                        if (filter.rarity) {
                            console.log('Checking ingame rarity:', filter.rarity);
                            switch(filter.rarity) {
                                case 'common': 
                                    console.log('Found ingame common:', AnalyticsData.totalingamecommon);
                                    totalDocs = AnalyticsData.totalingamecommon || 0; 
                                    break;
                                case 'uncommon': 
                                    console.log('Found ingame uncommon:', AnalyticsData.totalingameuncommon);
                                    totalDocs = AnalyticsData.totalingameuncommon || 0; 
                                    break;
                                case 'rare': 
                                    console.log('Found ingame rare:', AnalyticsData.totalingamerare);
                                    totalDocs = AnalyticsData.totalingamerare || 0; 
                                    break;
                                case 'epic': 
                                    console.log('Found ingame epic:', AnalyticsData.totalingameepic);
                                    totalDocs = AnalyticsData.totalingameepic || 0; 
                                    break;
                                case 'legendary': 
                                    console.log('Found ingame legendary:', AnalyticsData.totalingamelegendary);
                                    totalDocs = AnalyticsData.totalingamelegendary || 0; 
                                    break;
                            }
                        } else {
                            console.log('Calculating total ingame codes...');
                            totalDocs = (AnalyticsData.totalingamecommon + 
                                       AnalyticsData.totalingameuncommon + 
                                       AnalyticsData.totalingamerare + 
                                       AnalyticsData.totalingameepic + 
                                       AnalyticsData.totalingamelegendary) || 0;
                            console.log('Total ingame codes:', totalDocs);
                        }
                        break;
                    case 'exclusive':
                        console.log('Checking exclusive codes...');
                        if (filter.rarity) {
                            console.log('Checking exclusive rarity:', filter.rarity);
                            switch(filter.rarity) {
                                case 'common': 
                                    console.log('Found exclusive common:', AnalyticsData.totalexclusivecommon);
                                    totalDocs = AnalyticsData.totalexclusivecommon || 0; 
                                    break;
                                case 'uncommon': 
                                    console.log('Found exclusive uncommon:', AnalyticsData.totalexclusiveuncommon);
                                    totalDocs = AnalyticsData.totalexclusiveuncommon || 0; 
                                    break;
                                case 'rare': 
                                    console.log('Found exclusive rare:', AnalyticsData.totalexclusiverare);
                                    totalDocs = AnalyticsData.totalexclusiverare || 0; 
                                    break;
                                case 'epic': 
                                    console.log('Found exclusive epic:', AnalyticsData.totalexclusiveepic);
                                    totalDocs = AnalyticsData.totalexclusiveepic || 0; 
                                    break;
                                case 'legendary': 
                                    console.log('Found exclusive legendary:', AnalyticsData.totalexclusivelegendary);
                                    totalDocs = AnalyticsData.totalexclusivelegendary || 0; 
                                    break;
                            }
                        } else {
                            console.log('Calculating total exclusive codes...');
                            totalDocs = (AnalyticsData.totalexclusivecommon + 
                                       AnalyticsData.totalexclusiveuncommon + 
                                       AnalyticsData.totalexclusiverare + 
                                       AnalyticsData.totalexclusiveepic + 
                                       AnalyticsData.totalexclusivelegendary) || 0;
                            console.log('Total exclusive codes:', totalDocs);
                        }
                        break;
                    case 'chest':
                        console.log('Checking chest codes...');
                        if (filter.rarity) {
                            console.log('Checking chest rarity:', filter.rarity);
                            switch(filter.rarity) {
                                case 'common': 
                                    console.log('Found chest common:', AnalyticsData.totalchestcommon);
                                    totalDocs = AnalyticsData.totalchestcommon || 0; 
                                    break;
                                case 'uncommon': 
                                    console.log('Found chest uncommon:', AnalyticsData.totalchestuncommon);
                                    totalDocs = AnalyticsData.totalchestuncommon || 0; 
                                    break;
                                case 'rare': 
                                    console.log('Found chest rare:', AnalyticsData.totalchestrare);
                                    totalDocs = AnalyticsData.totalchestrare || 0; 
                                    break;
                                case 'epic': 
                                    console.log('Found chest epic:', AnalyticsData.totalchestepic);
                                    totalDocs = AnalyticsData.totalchestepic || 0; 
                                    break;
                                case 'legendary': 
                                    console.log('Found chest legendary:', AnalyticsData.totalchestlegendary);
                                    totalDocs = AnalyticsData.totalchestlegendary || 0; 
                                    break;
                            }
                        } else {
                            console.log('Calculating total chest codes...');
                            totalDocs = (AnalyticsData.totalchestcommon + 
                                       AnalyticsData.totalchestuncommon + 
                                       AnalyticsData.totalchestrare + 
                                       AnalyticsData.totalchestepic + 
                                       AnalyticsData.totalchestlegendary) || 0;
                            console.log('Total chest codes:', totalDocs);
                        }
                        break;
                    case 'robux':
                        console.log('Checking robux codes...');
                        if (filter.rarity) {
                            console.log('Checking robux rarity:', filter.rarity);
                            switch(filter.rarity) {
                                case 'common': 
                                    console.log('Found robux common:', AnalyticsData.totalrobuxcommon);
                                    totalDocs = AnalyticsData.totalrobuxcommon || 0; 
                                    break;
                                case 'uncommon': 
                                    console.log('Found robux uncommon:', AnalyticsData.totalrobuxuncommon);
                                    totalDocs = AnalyticsData.totalrobuxuncommon || 0; 
                                    break;
                                case 'rare': 
                                    console.log('Found robux rare:', AnalyticsData.totalrobuxrare);
                                    totalDocs = AnalyticsData.totalrobuxrare || 0; 
                                    break;
                                case 'epic': 
                                    console.log('Found robux epic:', AnalyticsData.totalrobuxepic);
                                    totalDocs = AnalyticsData.totalrobuxepic || 0; 
                                    break;
                                case 'legendary': 
                                    console.log('Found robux legendary:', AnalyticsData.totalrobuxlegendary);
                                    totalDocs = AnalyticsData.totalrobuxlegendary || 0; 
                                    break;
                            }
                        } else {
                            console.log('Calculating total robux codes...');
                            totalDocs = (AnalyticsData.totalrobuxcommon + 
                                       AnalyticsData.totalrobuxuncommon + 
                                       AnalyticsData.totalrobuxrare + 
                                       AnalyticsData.totalrobuxepic + 
                                       AnalyticsData.totalrobuxlegendary) || 0;
                            console.log('Total robux codes:', totalDocs);
                        }
                        break;
                    case 'ticket':
                        console.log('Checking ticket codes...');
                        if (filter.rarity) {
                            console.log('Checking ticket rarity:', filter.rarity);
                            switch(filter.rarity) {
                                case 'common': 
                                    console.log('Found ticket common:', AnalyticsData.totalticketcommon);
                                    totalDocs = AnalyticsData.totalticketcommon || 0; 
                                    break;
                                case 'uncommon': 
                                    console.log('Found ticket uncommon:', AnalyticsData.totalticketuncommon);
                                    totalDocs = AnalyticsData.totalticketuncommon || 0; 
                                    break;
                                case 'rare': 
                                    console.log('Found ticket rare:', AnalyticsData.totalticketrare);
                                    totalDocs = AnalyticsData.totalticketrare || 0; 
                                    break;
                                case 'epic': 
                                    console.log('Found ticket epic:', AnalyticsData.totalticketepic);
                                    totalDocs = AnalyticsData.totalticketepic || 0; 
                                    break;
                                case 'legendary': 
                                    console.log('Found ticket legendary:', AnalyticsData.totalticketlegendary);
                                    totalDocs = AnalyticsData.totalticketlegendary || 0; 
                                    break;
                            }
                        } else {
                            console.log('Calculating total ticket codes...');
                            totalDocs = (AnalyticsData.totalticketcommon + 
                                       AnalyticsData.totalticketuncommon + 
                                       AnalyticsData.totalticketrare + 
                                       AnalyticsData.totalticketepic + 
                                       AnalyticsData.totalticketlegendary) || 0;
                            console.log('Total ticket codes:', totalDocs);
                        }
                    }
    } else {
        totalDocs = (AnalyticsData.totalclaimed + AnalyticsData.totalapproved + AnalyticsData.totaltoclaim + AnalyticsData.totalexpired) || 0;
        console.log('Calculating total codes:', totalDocs);
    }
        const totalPages = Math.ceil(totalDocs / pageOptions.limit);



    return res.json({
        message: "success",
        data: finalData,
        totalPages,
        totalDocs,
    });
}

// check code

// exports.checkcode = async (req, res) => {
//     const { code } = req.body;

//     if (!code) return res.status(400).json({ message: "bad-request", data: "Please provide a code!" });

//     const codeExists = await Code.findOne({ code: code })
//         .then(data => data)
//         .catch(err => {
//             console.log(`There's a problem checking the code. Error ${err}`);
//             return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
//         });

//     if (!codeExists) return res.status(400).json({ message: "bad-request", data: "Code does not exist!" });
//     if (codeExists.isUsed) return res.status(400).json({ message: "bad-request", data: "Code has already been redeemed!" });
//     if (codeExists.expiration < new Date()) return res.status(400).json({ message: "bad-request", data: "Code has expired!" });
//     if (codeExists.status === "claimed") return res.status(400).json({ message: "bad-request", data: "Code has already been redeemed!" });
//     if (codeExists.status === "to-generate") return res.status(400).json({ message: "bad-request", data: "Code is not available!" });


//     return res.json({
//         message: "success",
//         data: codeExists
//     })
// }


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

        await Analytics.findOneAndUpdate({},
            { $inc: { totalclaimed: 1, totaltoclaim: -1, [`totalclaimed${codeExists.type}`]: 1, [`totalclaimed${codeExists.type}`]: -1 } },
            { new: true }
        )
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the analytics. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
        
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

    const { code, guardian, email, contact, address, robloxid } = req.body;
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
    // robux redeem code
    if (codeExists.type === "robux") {
        
        if (!robloxid || !email || !address) return res.status(400).json({ message: "bad-request", data: "Please fill in all the required fields!" });
        if (codeExists.status !== "pre-claimed") return res.status(400).json({ message: "bad-request", data: "Ticket is not available!" });
        // save details to code
        codeExists.name = robloxid;
        codeExists.email = email;
        codeExists.isUsed = true;
        codeExists.status = "claimed";

        await codeExists.save();
        await Analytics.findOneAndUpdate({},
            { $inc: { totalclaimed: 1, totaltoclaim: -1, [`totalclaimed${codeExists.type}`]: 1, [`totalclaimed${codeExists.type}`]: -1 } },
            { new: true }
        )
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the analytics. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

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

        const ticket = await Ticket.findById(codeExists.ticket)
            .then(data => data)
            .catch(err => {
                console.log(`There's a problem checking the ticket. Error ${err}`);
                return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
            });

        if (!ticket) return res.status(400).json({ message: "bad-request", data: "Ticket does not exist!" });
        if (codeExists.status !== "pre-claimed") return res.status(400).json({ message: "bad-request", data: "Ticket is not available!" });

        ticket.status = "claimed";
        await ticket.save();

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
        await Analytics.findOneAndUpdate({},
            { $inc: { totalclaimed: 1, totaltoclaim: -1 } },
            { new: true }
        )
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the analytics. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
        
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

    await Analytics.findOneAndUpdate({},
        { $inc: { totalapproved: status === "approved" ? 1 : 0, totalclaimed: -1 } },
        { new: true }
    )
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem updating the analytics. Error ${err}`);
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
    });

    
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
        let totalToExport = end - start;

        // Immediately return success to client
        res.json({ message: "success", status: "export-started" });

        // Start export in background
        (async () => {
            let batchOffset = 0;
            for (let fileNum = 1; batchOffset < (end - start); fileNum++) {
                const currentLimit = Math.min(CHUNK_SIZE, end - start - batchOffset);
                if (currentLimit <= 0) break;

                console.log(`Exporting batch ${fileNum} with limit ${currentLimit}...`);

                const batchProgress = (batchOffset / (end - start));
                const percentage1 = Math.round(20 + (batchProgress * 30));
                io.emit('export-progress', {
                    percentage: percentage1,
                    status: `Fetching data for batch ${fileNum}...`
                });

                const codes = await Code.find(filter)
                    .select('code')
                    .sort({ index: -1 })
                    .skip(start + batchOffset)
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
                batchOffset += CHUNK_SIZE;
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

    console.log(updatedata);
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

        console.log(`Archiving ${originalCodes.length} codes...`);
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
    const analyticsUpdate = { $inc: {} };
    
    const analyticsData = await Analytics.findOne({});
    console.log(`Current analytics data:`, analyticsData);
    // Update status counters
    if (code.status === "claimed") analyticsUpdate.$inc.totalclaimed = direction;
    if (code.status === "to-claim") analyticsUpdate.$inc.totaltoclaim = direction;
    if (code.status === "approved") analyticsUpdate.$inc.totalapproved = direction;
    if (code.status === "to-generate") analyticsUpdate.$inc.totaltogenerate = direction;
    if (code.status === "rejected") analyticsUpdate.$inc.totalrejected = direction;
    
    // Update type-rarity specific counters
    if (code.type && code.rarity) {
        const typeRarityField = `total${code.type}${code.rarity}`;
        analyticsUpdate.$inc[typeRarityField] = direction;
        if (code.status === "claimed" || code.isUsed === true) {
            analyticsUpdate.$inc[`totalclaimed${code.type}`] = direction;
        } else {
            analyticsUpdate.$inc[`totalunclaimed${code.type}`] = direction;
        }

        console.log(`${analyticsUpdate.$inc[typeRarityField]} for ${typeRarityField}`);
    }


    // Update archive counter with opposite direction
    analyticsUpdate.$inc.totalarchived = -direction;

    console.log(`Updating analytics for code ${code._id}:`, analyticsUpdate);
    const result = await Analytics.findOneAndUpdate({}, analyticsUpdate, { new: true });
    console.log(`Updated analytics for code ${code._id}:`, result);
}

async function updateAnalyticsOnEdit(original, updated) {
    const analyticsUpdate = { $inc: {} };

    // Status change
    if (updated.status && updated.status !== original.status) {
        // Handle original status decrements
        if (original.status === "claimed") {
            analyticsUpdate.$inc.totalclaimed = -1;
            analyticsUpdate.$inc[`totalclaimed${original.type}`] = -1;
        } else if (original.status === "to-claim") {
            analyticsUpdate.$inc.totaltoclaim = -1;
            analyticsUpdate.$inc[`totalunclaimed${original.type}`] = -1;
        } else if (original.status === "approved") {
            analyticsUpdate.$inc.totalapproved = -1;
        } else if (original.status === "rejected") {
            analyticsUpdate.$inc.totalrejected = -1;
        } else if (original.status === "to-generate") {
            analyticsUpdate.$inc.totaltogenerate = -1;
        }

        // Handle new status increments
        if (updated.status === "claimed") {
            analyticsUpdate.$inc.totalclaimed = 1;
            analyticsUpdate.$inc[`totalclaimed${original.type}`] = 1;
        } else if (updated.status === "to-claim") {
            analyticsUpdate.$inc.totaltoclaim = 1;
            analyticsUpdate.$inc[`totalunclaimed${original.type}`] = 1;
        } else if (updated.status === "approved") {
            analyticsUpdate.$inc.totalapproved = 1;
        } else if (updated.status === "rejected") {
            analyticsUpdate.$inc.totalrejected = 1;
        } else if (updated.status === "to-generate") {
            analyticsUpdate.$inc.totaltogenerate = 1;
        }
    }

    // Type/rarity change
    const oldType = original.type;
    const oldRarity = original.rarity;
    const newType = updated.type || original.type;
    const newRarity = updated.rarity || original.rarity;

    if (oldType && oldRarity && (oldType !== newType || oldRarity !== newRarity)) {
        // Decrement old type/rarity combination
        analyticsUpdate.$inc[`total${oldType}${oldRarity}`] = -1;
        
        // If status is claimed, update type-specific claimed counter
        if (original.status === "claimed") {
            analyticsUpdate.$inc[`totalclaimed${oldType}`] = -1;
            analyticsUpdate.$inc[`totalclaimed${newType}`] = 1;
        } else {
            analyticsUpdate.$inc[`totalunclaimed${oldType}`] = -1;
            analyticsUpdate.$inc[`totalunclaimed${newType}`] = 1;
        }
        
        // Increment new type/rarity combination
        analyticsUpdate.$inc[`total${newType}${newRarity}`] = 1;
    }

    // Only update if there are changes
    if (Object.keys(analyticsUpdate.$inc).length > 0) {
        console.log('Updating analytics:', analyticsUpdate);
        await Analytics.findOneAndUpdate({}, analyticsUpdate, { new: true });
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

    // check code status

        if (
            code.status === "claimed" ||
            code.status === "approved" ||
            code.status === "rejected"
        ) {
            // Build analytics update
            const analyticsUpdate = {
                $inc: {
                    totaltoclaim: 1,
                    totalclaimed: code.status === "claimed" ? -1 : 0,
                    totalapproved: code.status === "approved" ? -1 : 0,
                    [`total${code.type}${code.rarity}`]: code.status === "claimed" ? -1 : 0,
                    [`total${code.type}${code.rarity}`]: code.status === "approved" ? -1 : 0,
                    [`total${code.type}claimed`]: code.status === "claimed" ? -1 : 0,
                    [`total${code.type}unclaimed`]: 1
                }
            };

            await Analytics.findOneAndUpdate({}, analyticsUpdate, { new: true });
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