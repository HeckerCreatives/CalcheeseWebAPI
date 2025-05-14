const moment = require("moment");
const Chest = require("../models/Chest")
const Code = require("../models/Code");
const Item = require("../models/Item");
const RobuxCode = require("../models/Robuxcode");
const Ticket  = require("../models/Ticket");
const { default: mongoose } = require("mongoose");


exports.newgeneratecode = async (req, res) => {
    const { chest, expiration, codeamount, item, type } = req.body;

    if (!chest || !expiration || !codeamount || !item) {
        return res.status(400).json({ message: "failed", data: "Please fill in all the required fields!" });
    }

    if (codeamount <= 0) {
        return res.status(400).json({ message: "failed", data: "Please enter a valid code amount!" });
    }

    const session = await Code.startSession();
    session.startTransaction();

    try {
        const chesttype = await Chest.findById(chest).session(session);
        if (!chesttype) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "failed", data: "Invalid chest type!" });
        }

        const codes = [];
        for (let i = 0; i < codeamount; i++) {
            const code = Math.random().toString(36).substring(2, 14).toUpperCase();
            codes.push(code);
        }

        let codeData = [];

        if (type === "robux") {
            const temprobuxcodes = await RobuxCode.find({ status: "to-generate" }).session(session);
            if (!temprobuxcodes || temprobuxcodes.length === 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: "failed", data: "No unclaimed Robux codes available!" });
            }

            if (codeamount > temprobuxcodes.length) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: "failed", data: "Requested Robux code quantity exceeds available quantity!" });
            }

            for (let i = 0; i < codeamount; i++) {
                const tempcode = temprobuxcodes[i];
                const generatedCode = codes[i];

                tempcode.status = "to-claim";
                await tempcode.save({ session });

                codeData.push({
                    chest: chesttype._id,
                    expiration: expiration,
                    code: generatedCode,
                    items: item,
                    robuxcode: tempcode._id,
                    type: "robux",
                    isUsed: false,
                });
            }
        } else if (type === "ticket") {
            const availableTickets = await Ticket.find({ status: "to-generate" }).session(session);
            if (!availableTickets || availableTickets.length === 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: "failed", data: "No available tickets!" });
            }

            if (codeamount > availableTickets.length) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: "failed", data: "Requested ticket quantity exceeds available quantity!" });
            }

            for (let i = 0; i < codeamount; i++) {
                const ticketDoc = availableTickets[i];
                const generatedCode = codes[i];

                ticketDoc.status = "to-claim";
                await ticketDoc.save({ session });

                codeData.push({
                    chest: chesttype._id,
                    expiration: expiration,
                    code: generatedCode,
                    items: item,
                    ticket: ticketDoc._id,
                    type: "ticket",
                    isUsed: false,
                });
            }
        } else if (type === "ingame") {
            for (let i = 0; i < codeamount; i++) {
                codeData.push({
                    chest: chesttype._id,
                    expiration: expiration,
                    code: codes[i],
                    items: item,
                    type: "ingame",
                    isUsed: false,
                });
            }
        } else {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "failed", data: "Invalid type!" });
        }

        await Code.insertMany(codeData, { session });
        await session.commitTransaction();
        session.endSession();

        res.json({ message: "success" });
    } catch (err) {
        console.log(`Transaction error: ${err}`);
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
    }
};


exports.getcodes = async (req, res) => {

    const { page, limit, type, item, chest, status } = req.query;
    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const filter = {};
    if (type) filter.type = type;
    if (item) filter.items = new mongoose.Types.ObjectId(item);
    if (chest) filter.chest = new mongoose.Types.ObjectId(chest);
    if (status && ['to-generate', "to-claim", 'claimed', "approved", null].includes(status.toLowerCase())) {
        filter.status = status;
    }
    const totalDocs = await Code.countDocuments(filter)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the codes. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totalPages = Math.ceil(totalDocs / pageOptions.limit);
    const codes = await Code.aggregate([
        {
            $match: filter,
        },
        {
            $lookup: {
                from: "chests",
                localField: "chest",
                foreignField: "_id",
                as: "chest",
            },
        },
        {
            $unwind: "$chest",
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
            $unwind: "$items",
        },
        {
            $lookup: {
                from: "robuxcodes",
                localField: "robuxcode",
                foreignField: "_id",
                as: "robuxcode",
            },
        },
        {
            $unwind: { path: "$robuxcode", preserveNullAndEmptyArrays: true },
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
    ])
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the codes. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const finalData = codes.map(code => {
        const result = {
            id: code._id,
            code: code.code,
            chest: {
                id: code.chest._id,
                chestid: code.chest.chestid,
                chestname: code.chest.chestname,
            },
            items: {
                id: code.items._id,
                itemid: code.items.itemid,
                itemname: code.items.itemname,
            },
            expiration: moment(code.expiration).format("YYYY-MM-DD"),
            type: code.type,
            isUsed: code.isUsed,
        };

        if (code.robuxcode && code.robuxcode._id) {
            result.robuxcode = {
                id: code.robuxcode._id,
                robuxcode: code.robuxcode.robuxcode,
            };
        }

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

    // used codes count

    const usedCodesCount = await Code.countDocuments({ ...filter, isUsed: true })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the used codes count. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const unusedCodesCount = await Code.countDocuments({ ...filter, isUsed: false })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the unused codes count. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({
        message: "success",
        data: finalData,
        totalPages,
        totalDocs,
        usedCodesCount,
        unusedCodesCount,
    });
}

// check code

exports.checkcode = async (req, res) => {
    const { code } = req.body;

    if (!code) return res.status(400).json({ message: "bad-request", data: "Please provide a code!" });

    const codeExists = await Code.findOne({ code: code })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem checking the code. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!codeExists) return res.status(400).json({ message: "bad-request", data: "Code does not exist!" });

    const finaldata = {
        codetype: codeExists.type,
        codestatus: codeExists.status
    } 

    return res.json({
        message: "success",
        data: finaldata
    })
}

exports.redeemcode = async (req, res) => {

    const { code, guardian, name, email, contact, address } = req.body;
    const picture = req.file ? req.file.filename : undefined;


    if (!code) return res.status(400).json({ message: "bad-request", data: "Please provide a code!" });
    
    const codeExists = await Code.findOne({ code: code })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem checking the code. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!codeExists) return res.status(400).json({ message: "bad-request", data: "Code does not exist!" });
    if (codeExists.isUsed) return res.status(400).json({ message: "bad-request", data: "Code has already been redeemed!" });

    // robux redeem code
    if (codeExists.type === "robux") {

        if (!name || !email) return res.status(400).json({ message: "bad-request", data: "Please fill in all the required fields!" });
       
        const robuxcode = await RobuxCode.findById(codeExists.robuxcode)
            .then(data => data)
            .catch(err => {
                console.log(`There's a problem checking the robux code. Error ${err}`);
                return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
            });

        if (!robuxcode) return res.status(400).json({ message: "bad-request", data: "Robux code does not exist!" });
        if (robuxcode.status !== "to-claim") return res.status(400).json({ message: "bad-request", data: "Robux code is not available!" });

        robuxcode.status = "claimed";
        await robuxcode.save();

        // save details to code
        codeExists.name = name;
        codeExists.email = email;
        codeExists.isUsed = true;

        await codeExists.save();
        return res.json({ message: "success" })
        
    } else 
    // ticket redeem code
    if (codeExists.type === "ticket") {
        console.log(guardian, contact, address, name, email, picture)
        if (!guardian || !contact || !address || !name || !email || !picture) return res.status(400).json({ message: "bad-request", data: "Please fill in all the required fields!" });

        const ticket = await Ticket.findById(codeExists.ticket)
            .then(data => data)
            .catch(err => {
                console.log(`There's a problem checking the ticket. Error ${err}`);
                return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
            });

        if (!ticket) return res.status(400).json({ message: "bad-request", data: "Ticket does not exist!" });
        if (ticket.status !== "to-claim") return res.status(400).json({ message: "bad-request", data: "Ticket is not available!" });

        ticket.status = "claimed";
        await ticket.save();

        // save details to code
        codeExists.name = name;
        codeExists.email = email;
        codeExists.contact = contact;
        codeExists.address = address;
        codeExists.guardian = guardian;
        codeExists.picture = picture;
        codeExists.isUsed = true;
        codeExists.status = "claimed";

        await codeExists.save();

        return res.json({ message: "success" })
    } else 
    // ingame redeem code
    if (codeExists.type === "ingame") {
        // update code to approved and return code
        if (!name) return res.status(400).json({ message: "bad-request", data: "Please fill in all the required fields!" });
        codeExists.isUsed = true;
        codeExists.status = "approved";
        await codeExists.save();

        return res.json({
            message: "success",
            data: {
                code: codeExists.code,
                type: codeExists.type,
            }
        }) 
    }

}