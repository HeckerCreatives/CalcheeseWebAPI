const moment = require("moment");
const Chest = require("../models/Chest")
const Code = require("../models/Code");
const Item = require("../models/Item");
const RobuxCode = require("../models/Robuxcode");
const Ticket  = require("../models/Ticket");
const { default: mongoose } = require("mongoose");
const { io } = require('../app');
const fs = require('fs');
const path = require('path');
const { generateRandomString, getNextCode } = require("../utils/codegenerator");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const archiver = require('archiver');
const { Analytics, RedeemedCodeAnalytics } = require("../models/Analytics");

exports.newgeneratecode = async (req, res) => {
    const { socketid, chest, expiration, codeamount, items, type } = req.body;

    if (!chest || !expiration || !codeamount || !items) {
        return res.status(400).json({ message: "failed", data: "Please fill in all the required fields!" });
    }

    if (codeamount <= 0) {
        return res.status(400).json({ message: "failed", data: "Please enter a valid code amount!" });
    }

    if (socketid) {
        io.to(socketid).emit('generate-progress', { 
            percentage: 0,
            status: 'Starting code generation...'
        });
    }
    

    // const session = await Code.startSession();
    // session.startTransaction();

    try {
        const chesttype = await Chest.findById(chest)
        // .session(session);
        if (!chesttype) {
            // await session.abortTransaction();
            // session.endSession();
            return res.status(400).json({ message: "failed", data: "Invalid chest type!" });
        }
        if (socketid) {
            io.to(socketid).emit('generate-progress', { 
                percentage: 10,
                status: 'Generating code patterns...'
            });
        }

        const codes = [];
        let codeLength = 9;
        
        if (type === "robux" || type === "ticket") {
            codeLength = 7;
        }

        // Get the last code from DB to continue sequence
        const totalCodes = await Code.countDocuments()


        // Remove hyphens from last code if exists
        let lastCode = totalCodes || 0;
        let currentCode = lastCode;

        for (let i = 0; i < codeamount; i++) {
            // Get next code in sequence
            currentCode = getNextCode(lastCode + i, codeLength);
            
            // Format with hyphens
            codes.push(currentCode);

            if (i % Math.max(1, Math.floor(codeamount / 10)) === 0) {
            const percentage = Math.round((i / codeamount) * 30) + 10;
            if (socketid) {
                io.to(socketid).emit('generate-progress', { 
                percentage,
                status: `Generating code patterns... ${i}/${codeamount}`
                });
            }
            }
        }

        if (socketid) {
            io.to(socketid).emit('generate-progress', { 
                percentage: 40,
                status: 'Checking for duplicate codes...'
            });
        }
        let codeData = [];

        if (socketid) {
            io.to(socketid).emit('generate-progress', { 
                percentage: 50,
                status: 'Preparing codes data...'
            });
        }

        // // Check for duplicate codes if there are existing codes remove it from the generated codes
       
        // console.time('Checking for duplicate codes');
        // const BATCH_SIZE = 250000;
        // for (let i = 0; i < codes.length; i += BATCH_SIZE) {
        //     const batch = codes.slice(i, i + BATCH_SIZE);
        //     const existingCodes = await Code.find({ 
        //       code: { $in: batch }
        //     }).select('code').lean();

        //     if (socketid) {
        //     io.to(socketid).emit('generate-progress', {
        //         percentage: Math.round((i / codes.length) * 20) + 20, // 20-40% progress
        //         status: `Checking for duplicate codes... ${Math.min(i + BATCH_SIZE, codeamount).toLocaleString()}/${codeamount.toLocaleString()}`
        //     });
        //     }

        //     if (existingCodes.length > 0) {
        //     const existingCodeSet = new Set(existingCodes.map(code => code.code));
        //     for (let j = 0; j < batch.length; j++) {
        //         if (existingCodeSet.has(batch[j])) {
        //         codes[i + j] = getNextCode(currentCode++, 9);
        //         }
        //     }
        //     }
        // }
        // console.timeEnd('Checking for duplicate codes');



        console.time('Code Processing Time');
        if (type === "robux") {
            const temprobuxcodes = await RobuxCode.find({ status: "to-generate" }).session(session);
            if (!temprobuxcodes || temprobuxcodes.length === 0) {
                // await session.abortTransaction();
                // session.endSession();
                return res.status(400).json({ message: "failed", data: "No unclaimed Robux codes available!" });
            }

            if (codeamount > temprobuxcodes.length) {
                // await session.abortTransaction();
                // session.endSession();
                return res.status(400).json({ message: "failed", data: "Requested Robux code quantity exceeds available quantity!" });
            }

            for (let i = 0; i < codeamount; i++) {
                const tempcode = temprobuxcodes[i];
                const generatedCode = codes[i];

                tempcode.status = "to-claim";
                await tempcode.save(
                    // { session }
                );

                codeData.push({
                    chest: chesttype._id,
                    expiration: expiration,
                    code: generatedCode,
                    items: items,
                    robuxcode: tempcode._id,
                    type: "robux",
                    isUsed: false,
                });

                if (i % Math.max(1, Math.floor(codeamount / 10)) === 0) {
                    const percentage = Math.round((i / codeamount) * 20) + 60; // 60-80% progress
                    if (socketid) {
                        io.to(socketid).emit('generate-progress', { 
                            percentage,
                            status: `Processing Robux codes... ${i}/${codeamount}`
                        });
                    }
                }
            }
        } else if (type === "ticket") {
            const availableTickets = await Ticket.find({ status: "to-generate" })
            // .session(session);
            if (!availableTickets || availableTickets.length === 0) {
                // await session.abortTransaction();
                // session.endSession();
                return res.status(400).json({ message: "failed", data: "No available tickets!" });
            }

            if (codeamount > availableTickets.length) {
                // await session.abortTransaction();
                // session.endSession();
                return res.status(400).json({ message: "failed", data: "Requested ticket quantity exceeds available quantity!" });
            }

            for (let i = 0; i < codeamount; i++) {
                const ticketDoc = availableTickets[i];
                const generatedCode = codes[i];

                ticketDoc.status = "to-claim";
                await ticketDoc.save();

                codeData.push({
                    chest: chesttype._id,
                    expiration: expiration,
                    code: generatedCode,
                    items: items,
                    ticket: ticketDoc._id,
                    type: "ticket",
                    isUsed: false,
                });

                if (i % Math.max(1, Math.floor(codeamount / 10)) === 0) {
                    const percentage = Math.round((i / codeamount) * 20) + 60; // 60-80% progress
                    if (socketid) {
                        io.to(socketid).emit('generate-progress', { 
                            percentage,
                            status: `Processing Ticket codes... ${i}/${codeamount}`
                        });
                    }
                }
            }
        } else if (type === "ingame") {
            const BATCH_SIZE = 100000;
                for (let batchStart = 0; batchStart < codeamount; batchStart += BATCH_SIZE) {
                    const batchEnd = Math.min(batchStart + BATCH_SIZE, codeamount);
                    let codeData = [];
                    for (let i = batchStart; i < batchEnd; i++) {
                        codeData.push({
                            chest: chesttype._id,
                            expiration: expiration,
                            code: codes[i],
                            items: items,
                            type: type,
                            isUsed: false,
                        });
                    }
                    await Code.insertMany(codeData);

                        if (socketid) {
                            const percentage = Math.round(((batchEnd) / codeamount) * 40) + 50; // 50-90% progress
                            io.to(socketid).emit('generate-progress', {
                                percentage,
                                status: `Saving In-Game codes. Progress: ${batchEnd.toLocaleString()}/${codeamount.toLocaleString()}`
                            });
                        }
                }
            const update = { $inc: { totaltoclaim: codeamount } };
                
            await Analytics.findOneAndUpdate({}, update, { new: true })
            return res.json({ message: "success" });
        } else {
            // await session.abortTransaction();
            // session.endSession();
            return res.status(400).json({ message: "failed", data: "Invalid type!" });
        }
        if (socketid) {
            io.to(socketid).emit('generate-progress', { 
                percentage: 90,
                status: 'Saving codes to database...'
            });
        }
        
        await Code.insertMany(codeData);
        console.timeEnd('Code Processing Time');
        if (socketid) {
            io.to(socketid).emit('generate-progress', { 
                percentage: 95,
                status: 'Finalizing transaction...'
            });
        }
        // await session.commitTransaction();
        // session.endSession();

        if (socketid) {
            io.to(socketid).emit('generate-progress', { 
                percentage: 100,
                status: 'Complete',
                success: true
            });
        }


            const update = { $inc: { totaltoclaim: codeamount } };
            
            if (type === 'robux' || type === 'ticket') {
            update.$inc.totaltogenerate = -codeamount;
            }

            await Analytics.findOneAndUpdate({}, update, { new: true })

            

        res.json({ message: "success" });
    } catch (err) {
        console.log(`Transaction error: ${err}`);
        // await session.abortTransaction();
        // session.endSession();
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
    }
};


exports.getcodes = async (req, res) => {

    const { page, limit, type, item, chest, status, search } = req.query;
    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const filter = {};
    if (type) filter.type = type;
    if (item) filter.items = { $in: [new mongoose.Types.ObjectId(item)] };
    if (chest) filter.chest = new mongoose.Types.ObjectId(chest);
    if (status && ['to-generate', "to-claim", 'claimed', "approved", "expired", null].includes(status.toLowerCase())) {
        if (status.toLowerCase() === "expired") {
            filter.expiration = { $lte: new Date() };
        } else {
            filter.status = status;
        }
    }
    if (search) {
        const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
        filter.$or = [
            { code: searchRegex },
            // { "chest.chestname": searchRegex },
            // { "items.itemname": searchRegex },
            { "robuxcode.robuxcode": searchRegex },
            { "ticket.ticketid": searchRegex }
        ];
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
                localField: "chest.itemid",
                foreignField: "_id",
                as: "items",
            },
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
        {
            $sort: { createdAt: -1 }
        }
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
            status: code.status,
            chest: {
                id: code.chest._id,
                chestid: code.chest.chestid,
                chestname: code.chest.chestname,
            },
             items: code.items.map(item => ({
                id: item._id,
                itemid: item.itemid,
                itemname: item.itemname,
                quantity: item?.quantity || 0,
            })),
            expiration: moment(code.expiration).format("YYYY-MM-DD"),
            type: code.type,
            isUsed: code.isUsed,
            claimdate: code.updatedAt
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

    const expiredCodesCount = await Code.countDocuments({
        ...filter,
        expiration: { $lt: new Date() },
        isUsed: false,
        status: { $nin: ["approved", "claimed"] }
    })        
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the expired codes count. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const AnalyticsData = await Analytics.findOne({})
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the analytics data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

        if (expiredCodesCount > 0) {
            if (AnalyticsData.totalexpired !== expiredCodesCount) {
                const diff = expiredCodesCount - (AnalyticsData.totalexpired || 0);
                await Analytics.findOneAndUpdate(
                    {},
                    { 
                        $set: { totalexpired: expiredCodesCount },
                        $inc: { totaltoclaim: -diff }
                    },
                    { new: true }
                )
                .then(data => data)
                .catch(err => {
                    console.log(`There's a problem updating the analytics. Error ${err}`);
                    return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
                });
            }
        }
    return res.json({
        message: "success",
        data: finalData,
        totalPages,
        totalDocs,
        expiredCodesCount,
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
  const { code } = req.body;

  if (!code)
    return res.status(400).json({
      message: "bad-request",
      data: "Please provide a code!",
    });

  try {
    const codeExists = await Code.findOne({ code })
      .populate('chest')              // Populate chest reference
      .populate('items');             // Populate code's item references

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

    if (codeExists.status === "claimed")
      return res.status(400).json({
        message: "bad-request",
        data: "Code has already been redeemed!",
      });

    if (codeExists.status === "to-generate")
      return res.status(400).json({
        message: "bad-request",
        data: "Code is not available!",
      });

    // Populate itemid inside the chest
    const populatedChest = await Chest.findById(codeExists.chest._id).populate('itemid');

    return res.json({
      message: "success",
      data: {
        ...codeExists.toObject(),
        chest: populatedChest, // Now contains populated itemid
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

        if (!name || !email || !address) return res.status(400).json({ message: "bad-request", data: "Please fill in all the required fields!" });
       
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
        codeExists.address = address;
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
        
    } else 
    // ticket redeem code
    if (codeExists.type === "ticket") {
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
    } else 
    // ingame redeem code
    if (codeExists.type === "ingame") {
        // update code to approved and return code
        if (!name) return res.status(400).json({ message: "bad-request", data: "Please fill in all the required fields!" });
        codeExists.isUsed = true;
        codeExists.status = "approved";
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

    try {
        // Find all codes to be deleted
        const codes = await Code.find({ _id: { $in: ids }});
        
        if (codes.length === 0) {
            return res.status(400).json({
                message: "bad-request", 
                data: "No valid codes found!"
            });
        }

        let analyticsUpdates = {
            totalclaimed: 0,
            totalapproved: 0,
            totaltogenerate: 0,
            totaltoclaim: 0,
            totalexpired: 0
        };

        // Process each code
        for (const code of codes) {
            if (code.status === "claimed") {
                continue; // Skip claimed codes
            }

            // Handle ticket type
            if (code.type === "ticket" && code.ticket) {
                await Ticket.findByIdAndUpdate(code.ticket, {
                    status: "to-generate"
                });
            }
            
            // Handle robux type
            else if (code.type === "robux" && code.robuxcode) {
                await RobuxCode.findByIdAndUpdate(code.robuxcode, {
                    status: "to-generate"
                });
            }

            // Update analytics counters
            const isExpired = code.expiration < new Date();
            
            analyticsUpdates.totalclaimed += code.isUsed ? -1 : 0;
            analyticsUpdates.totalapproved += code.status === "approved" ? -1 : 0;
            analyticsUpdates.totaltogenerate += code.status === "to-generate" ? -1 : 0;
            analyticsUpdates.totaltoclaim += code.status === "to-claim" ? -1 : 0;
            analyticsUpdates.totalexpired += isExpired ? 1 : 0;
        }

        // Update analytics in one operation
        await Analytics.findOneAndUpdate({}, {
            $inc: analyticsUpdates
        });

        // Delete all codes in one operation
        await Code.deleteMany({ _id: { $in: ids }});

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
        const { type, item, chest, status, dateRange, start, end } = req.query;
        const CHUNK_SIZE = parseInt(end) || 1000000; // Default 1 million per file

        // Build filter
        const filter = {};
        if (type) filter.type = type;
        if (item) filter.items = { $in: [new mongoose.Types.ObjectId(item)] };
        if (chest) filter.chest = new mongoose.Types.ObjectId(chest);
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

        const startIndex = Math.max(parseInt(start) || 1, 1) - 1; // 0-based index
        const endIndex = parseInt(end) || (startIndex + 10000000);
        const limit = endIndex - startIndex;
        // Get only the code field for the matching documents
        const totalDocs = await Code.countDocuments(filter);
        if (totalDocs === 0) {
            return res.status(404).json({ message: "No codes found matching the criteria" });
        }
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)){
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Simple headers for codes only
        const headers = [
            { id: 'code', title: 'Code' },
        ];
        let batch = 0
        let fileList = [];
        for (let skip = 0, fileNum = 1; skip < 3000000; skip += CHUNK_SIZE, fileNum++) {
            const codes = await Code.find(filter)
                .select('code')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(CHUNK_SIZE)
                .lean();

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
            
            fileList.push(filename);

            console.log(`batch ${batch}`)
            batch++;
        }


        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const zipFilename = `codes_export_${timestamp}.zip`;
        const zipPath = path.join(uploadsDir, zipFilename);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            res.download(zipPath, zipFilename, (err) => {
                if (err) {
                    console.log('Error downloading zip:', err);
                    return res.status(500).json({ message: "Error generating ZIP" });
                }
                fs.unlinkSync(zipPath); // optional: delete zip after download
                // Optionally, also delete the CSV files here if you want
                fileList.forEach(filename => {
                    const filePath = path.join(uploadsDir, filename);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                });
            });
        });

        archive.pipe(output);
        fileList.forEach(filename => {
            archive.file(path.join(uploadsDir, filename), { name: filename });
        });
        archive.finalize();
        
    } catch (err) {
        console.log(`Error exporting codes to CSV: ${err}`);
        return res.status(500).json({ 
            message: "bad-request", 
            data: "There's a problem generating the CSV file. Please try again or contact support." 
        });
    }
};