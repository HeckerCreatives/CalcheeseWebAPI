const moment = require("moment");
const Chest = require("../models/Chest")
const { Code, CodeHistory, RedeemCode, Item, } = require("../models/Code")

// #region CODE AND HISTORY

exports.generatecode = async (req, res) => {
    const { id } = req.user;

    const { chest, expiration, codeamount, items, type } = req.body;

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

    // Generate many codes based on the code amount
    const codes = [];

    for (let i = 0; i < codeamount; i++) {
        const code = Math.random().toString(36).substring(2, 14).toUpperCase();

        codes.push(code);
    }
    const history = await CodeHistory.create({ codeid: codes, codes: codeamount, chest: chesttype._id, expiration: expiration, items: items, usedCodes: 0, type: type, usedCodeid: [] })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the code history. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
    
    const codeData = codes.map(code => {
        return {
            codehistory: history._id,
            chest: chesttype._id,
            expiration: expiration,
            code: code,
            items: items,
            isUsed: false
        };
    });

    await Code.insertMany(codeData)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the codes. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};
exports.getcodehistory = async (req, res) => {

    const { id } = req.user;

    const { page, limit, filter, type, sortField, sortOrder } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const filterOptions = {
        status: filter || "active",
    };

    // Validate type
    if (type) {
        if (type === "robux" || type === "ticket") {
            filterOptions.type = type;
        } else {
            return res.status(400).json({ message: "failed", data: "Please enter a valid type!" });
        }
    }

    const sortOptions = {};
    if (sortField && sortOrder) {
        const order = parseInt(sortOrder);
        if (order === 1 || order === -1) {
            sortOptions[sortField] = order;
        } else {
            return res.status(400).json({ message: "failed", data: "Invalid sort order! Use 1 for ascending or -1 for descending." });
        }
    } else {
        sortOptions.createdAt = -1; // Default sort by createdAt in descending order
    }
    
    console.log("Sort Options:", sortOptions); // Debugging log

    const history = await CodeHistory.find(filterOptions)
        .populate("items")
        .populate("chest")
        .sort(sortOptions)
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the code history. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totaldocs = await CodeHistory.countDocuments(filterOptions)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the code history. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totalpages = Math.ceil(totaldocs / pageOptions.limit);

    const finaldata = {
        totalpages: totalpages,
        data: []
    };

    history.forEach((item) => {
        finaldata.data.push({
            id: item._id,
            codeamount: item.codes,
            usedCodes: item.usedCodes,
            type: item.type,
            chesttype: item.chest.chesttype,
            chestname: item.chest.chestname,
            items: item.items.map(item => ({
                id: item._id,
                name: item.itemname,
                quantity: item.quantity,
            })),
            status: item.status,
            expiration: moment(item.expiration).format('YYYY-MM-DD'),
            createdAt: moment(item.createdAt).format('YYYY-MM-DD'),
            codeids: item.codeid,
            usedCodeid: item.usedCodeid,
        });
    });

    return res.json({ message: "success", data: finaldata });
};

exports.editcodehistory = async (req, res) => {
    const { id } = req.user
    const { codehistoryid, items, expiration, chest, status } = req.body;

    if (!codehistoryid){
        return res.status(400).json({ message: "failed", data: "Please provide a code history ID!" });
    }

    const updateData = {};
    if (items) {
        updateData.items = items;
    }
    if (expiration) {
        updateData.expiration = expiration;
    }
    if (chest) {
        updateData.chest = chest;
    }
    if (status) {
        updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "failed", data: "Please provide at least one field to update!" });
    }

    const codehistory = await CodeHistory.findById(codehistoryid)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the code history. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!codehistory) {
        return res.status(404).json({ message: "failed", data: "Code history not found!" });
    }

    // Update the code history with the new data
    Object.keys(updateData).forEach(key => {
        codehistory[key] = updateData[key];
    });

    await codehistory.save()
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the code history. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    // Update all related codes using updateMany
    await Code.updateMany(
        { codehistory: codehistoryid },
        { $set: updateData }
    ).catch(err => {
        console.log(`There's a problem updating the codes. Error ${err}`);
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
    });

    return res.json({ message: "success" });
}

// #endregion

// #region Item And Chest
exports.createItem = async (req, res) => {
    const { id } = req.user

    const { name, type, quantity } = req.body

    if (!name || !type || !quantity) {
        return res.status(400).json({ message: "failed", data: "Please fill in all the required fields!" });
    }

    if (quantity <= 0) {
        return res.status(400).json({ message: "failed", data: "Please enter a valid quantity!" });
    }

    if (type !== "robux" && type !== "ticket") {
        return res.status(400).json({ message: "failed", data: "Please enter a valid type!" });
    }

    await Item.create({ itemname: name, itemtype: type, quantity: quantity })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the item. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
}

exports.editItem = async (req, res) => {
    const { id } = req.user
    const { itemid, name, type, quantity } = req.body

    if (!itemid) {
        return res.status(400).json({ message: "failed", data: "Please provide an item ID!" });
    }

    // only edit those fields that have values

    const updateData = {};
    if (name) {
        updateData.itemname = name;
    }
    if (type) {
        if (type !== "robux" && type !== "ticket") {
            return res.status(400).json({ message: "failed", data: "Please enter a valid type!" });
        }
        updateData.itemtype = type;
    }
    if (quantity) {
        if (quantity <= 0) {
            return res.status(400).json({ message: "failed", data: "Please enter a valid quantity!" });
        }
        updateData.quantity = quantity;
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "failed", data: "Please provide at least one field to update!" });
    }

    const item = await Item.findById(itemid)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the item. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
    
    
    if (!item) {
        return res.status(404).json({ message: "failed", data: "Item not found!" });
    }

    // Update the item with the new data
    Object.keys(updateData).forEach(key => {
        item[key] = updateData[key];
    });
    
    await item.save()
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the item. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
}

    
exports.getItems = async (req, res) => {
    const { id } = req.user
    const { page, limit, type } = req.query

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const filterOptions = {};
    if (type) {
        if (type === "robux" || type === "ticket") {
            filterOptions.itemtype = type;
        } else {
            return res.status(400).json({ message: "failed", data: "Please enter a valid type!" });
        }
    }

    const items = await Item.find(filterOptions)
        .sort({ createdAt: -1 })
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the items. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totaldocs = await Item.countDocuments(filterOptions)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem counting the items. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    
    const totalpages = Math.ceil(totaldocs / pageOptions.limit);

    const finaldata = {
        totalpages: totalpages,
        data: items.map(item => ({
            id: item._id,
            name: item.itemname,
            type: item.itemtype,
            quantity: item.quantity,
            createdAt: moment(item.createdAt).format('YYYY-MM-DD'),
        })),
    };

    return res.json({ message: "success", data: finaldata });

}

exports.getchests = async (req, res) => {

    const { id } = req.user

    const chests = await Chest.find()
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the chests. Error ${err}`);

            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const finaldata = {
        data: chests.map(item => ({
            id: item._id,
            name: item.chestname,
            type: item.chesttype,
            createdAt: moment(item.createdAt).format('YYYY-MM-DD'),
        })),
    };

    return res.json({ message: "success", data: finaldata.data });
}

// #endregion

// #region Redeem Code

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


exports.getRedeemCodeHistory = async (req, res) => {
    const { page, limit, type } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const filterOptions = {};
    if (type) {
        if (type === "robux" || type === "ticket") {
            filterOptions.type = type;
        } else {
            return res.status(400).json({ message: "failed", data: "Please enter a valid type!" });
        }
    }

    const history = await RedeemCode.find(filterOptions)
        .sort({ createdAt: -1 })
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the redeem code history. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totaldocs = await RedeemCode.countDocuments(filterOptions)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem counting the redeem code history. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totalpages = Math.ceil(totaldocs / pageOptions.limit);

    const finaldata = {
        totalpages: totalpages,
        data: history.map(item => ({
            id: item._id,
            code: item.code,
            amount: item.amount,
            type: item.type,
            email: item.email,
            name: item.name,
            picture: item.picture,
            createdAt: moment(item.createdAt).format('YYYY-MM-DD'),
        })),
    };

    return res.json({ message: "success", data: finaldata });
};


exports.editredeemcodestatus = async (req, res) => {

    const { id } = req.user

    const { redeemid, status } = req.body;

    if (!redeemid || !status) {
        return res.status(400).json({ message: "failed", data: "Please provide both redeem code ID and status!" });
    }

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "failed", data: "Invalid status value!" });
    }

    const redeemCode = await RedeemCode.findById(id)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem finding the redeem code. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!redeemCode) {
        return res.status(404).json({ message: "failed", data: "Redeem code not found!" });
    }

    redeemCode.status = status;

    await redeemCode.save()
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the redeem code status. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};


exports.deleteredeemcode = async (req, res) => {
    const { id } = req.user

    const { redeemid } = req.body;

    if (!redeemid) {
        return res.status(400).json({ message: "failed", data: "Please provide a redeem code ID!" });
    }

    const redeemCode = await RedeemCode.findById(redeemid)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem finding the redeem code. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!redeemCode) {
        return res.status(404).json({ message: "failed", data: "Redeem code not found!" });
    }

    await RedeemCode.findByIdAndDelete(redeemid)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem deleting the redeem code. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });

}

// #endregion