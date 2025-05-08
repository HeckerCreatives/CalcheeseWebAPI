const moment = require("moment");
const Chest = require("../models/Chest")
const { Code, Item, } = require("../models/Code");
const RobuxCode = require("../models/Robuxcode");
const { Ticket } = require("../models/Ticket");

// #region CODE AND HISTORY

exports.generatecode = async (req, res) => {
    const { chest, expiration, codeamount, items } = req.body;

    if (!chest || !expiration || !codeamount || !items) {
        return res.status(400).json({ message: "failed", data: "Please fill in all the required fields!" });
    }

    if (codeamount <= 0) {
        return res.status(400).json({ message: "failed", data: "Please enter a valid code amount!" });
    }

    if (items.length <= 0) {
        return res.status(400).json({ message: "failed", data: "Please enter a valid item!" });
    }

    const chesttype = await Chest.findById(chest)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the chest type data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const codes = [];
    for (let i = 0; i < codeamount; i++) {
        const code = Math.random().toString(36).substring(2, 14).toUpperCase();
        codes.push(code);
    }

    const tempitemdata = [];

    for (const temp of items) {
        const { type, amount } = temp;

        if (!type || !amount || amount <= 0) {
            return res.status(400).json({ message: "failed", data: "Invalid item type or amount!" });
        }

        if (type === "robuxcode") {
            const temprobuxcodes = await RobuxCode.find({ status: "to-generate" })
                .then(data => data)
                .catch(err => {
                    console.log(`Error fetching Robux codes: ${err}`);
                    return res.status(400).json({ message: "failed", data: "Error fetching Robux codes!" });
                });

            if (temprobuxcodes.length === 0) {
                return res.status(400).json({ message: "failed", data: "No unclaimed Robux codes available!" });
            }

            if (amount > temprobuxcodes.length) {
                return res.status(400).json({ message: "failed", data: "Requested Robux code quantity exceeds available quantity!" });
            }

            temprobuxcodes.slice(0, amount).forEach((tempcode, index) => {
                const { _id } = tempcode;
                const generatedCode = codes[index];

                tempitemdata.push({
                    type: "robuxcode",
                    robuxcode: new mongoose.Types.ObjectId(_id),
                });

                // Update RobuxCode with the generated code
                tempcode.code = generatedCode;
                tempcode.status = "to-claim";
                tempcode.save().catch(err => {
                    console.log(`Error updating Robux code: ${err}`);
                });
            });
        } else if (type === "tickets") {
            const availableTickets = await Ticket.find({ status: "to-generate" })
                .then(data => data)
                .catch(err => {
                    console.log(`Error fetching tickets: ${err}`);
                    return res.status(400).json({ message: "failed", data: "Error fetching tickets!" });
                });

            if (availableTickets.length === 0) {
                return res.status(400).json({ message: "failed", data: "No available tickets!" });
            }

            if (amount > availableTickets.length) {
                return res.status(400).json({ message: "failed", data: "Requested ticket quantity exceeds available quantity!" });
            }

            availableTickets.slice(0, amount).forEach((ticket, index) => {
                const { _id } = ticket;
                const generatedCode = codes[index];

                tempitemdata.push({
                    type: "tickets",
                    ticket: new mongoose.Types.ObjectId(_id),
                });

                // Update Ticket with the generated code
                ticket.code = generatedCode;
                ticket.status = "to-claim";
                ticket.save().catch(err => {
                    console.log(`Error updating ticket: ${err}`);
                });
            });
        } else {
            return res.status(400).json({ message: "failed", data: `Invalid item type: ${type}` });
        }
    }

    const codeData = codes.map(code => ({
        chest: chesttype._id,
        expiration: expiration,
        code: code,
        items: tempitemdata,
        isUsed: false,
    }));

    await Code.insertMany(codeData)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the codes. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success", data: { codes, items: tempitemdata } });
};


// #endregion

// #region Item And Chest


// exports.getchests = async (req, res) => {

//     const { id } = req.user

//     const chests = await Chest.find()
//         .then(data => data)
//         .catch(err => {
//             console.log(`There's a problem getting the chests. Error ${err}`);

//             return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
//         });

//     const finaldata = {
//         data: chests.map(item => ({
//             id: item._id,
//             name: item.chestname,
//             type: item.chesttype,
//             createdAt: moment(item.createdAt).format('YYYY-MM-DD'),
//         })),
//     };

//     return res.json({ message: "success", data: finaldata.data });
// }

exports.getchests = async (req, res) => {
    const { id } = req.user;
  
    try {
      // Fetch all chests
      const chests = await Chest.find();
  
      // For each chest, count associated codes
      const finaldata = await Promise.all(
        chests.map(async (item) => {
          const totalCodes = await Code.countDocuments({ chest: item._id });
          const totalUsed = await Code.countDocuments({ chest: item._id, isUsed: true });
          const totalUnused = await Code.countDocuments({ chest: item._id, isUsed: false });
  
          return {
            id: item._id,
            name: item.chestname,
            type: item.chesttype,
            totalused: totalUsed,
            totalunused: totalUnused,
            createdAt: moment(item.createdAt).format("YYYY-MM-DD"),
            totalCodes,
          };
        })
      );
  
      return res.json({ message: "success", data: finaldata });
    } catch (err) {
      console.error(`There's a problem getting the chests. Error: ${err}`);
      return res.status(400).json({
        message: "bad-request",
        data: "There's a problem with the server! Please contact customer support for more details.",
      });
    }
}

// #endregion


exports.redeemcode = async (req, res) => {
     
    const { code, email, name  } = req.body;

    if (!code || !email || !name) {
        return res.status(400).json({ message: "failed", data: "Please fill in all the required fields!" });
    }

    const picture = req.file ? req.file.filename : null;
    if (!picture) {
        return res.status(400).json({ message: "failed", data: "Please upload a picture!" });
    }

    // check code

    const codeData = await Code.findOne({ code: code })
        .populate("items")
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the code data. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

        
    if (!codeData) {
         return res.status(400).json({ message: "failed", data: "Please enter a valid code!" });
    }
    if(codeData.isUsed == true) {
        return res.status(400).json({ message: "failed", data: "This code has already been used!" });
    }

    if (codeData.expiration < new Date()) {
        return res.status(400).json({ message: "failed", data: "Please enter a valid code!" });
    }

    const Codehistory = await CodeHistory.findById(codeData.codehistory)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the code history data. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

        // Sum up all quantities and get the first item name since they're the same
        const totalQuantity = codeData.items.reduce((sum, item) => sum + item.quantity, 0);
        const itemName = codeData.items[0].itemname;

    
    // update code to used
    codeData.isUsed = true;
    codeData.status = "used";
    Codehistory.usedCodes += 1;
    Codehistory.usedCodeid.push(codeData.code);

    await Codehistory.save()
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the code history data. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
    await codeData.save()
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the code data. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });


  


    await RedeemCode.create({ code: codeData._id, amount: totalQuantity, type: Codehistory.type, email: email, name: name, picture: picture })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the redeem code data. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    // Respond with success
    return res.json({ message: "success" });
};
