const Item = require("../models/Item");
const moment = require("moment");

exports.createItem = async (req, res) => {
    const { itemid, itemname, quantity, category } = req.body;

    if (!itemid) return res.status(400).json({ message: "bad-request", data: "Please provide an item id!" });
    if (!itemname) return res.status(400).json({ message: "bad-request", data: "Please provide an item name!" });
    if (quantity && typeof quantity !== "number") return res.status(400).json({ message: "bad-request", data: "Quantity must be a number!" });
    if (quantity && quantity < 0) return res.status(400).json({ message: "bad-request", data: "Quantity cannot be negative!" });
    if (category && !["exclusive", "roblux", "ticket", "ingame", "chest"].includes(category)) {
        return res.status(400).json({ message: "bad-request", data: "Invalid category! Must be one of: exclusive, roblux, ticket, ingame, chest." });
    }
    const itemExists = await Item.findOne({ itemid })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem checking the item data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (itemExists) return res.status(400).json({ message: "bad-request", data: "Item already exists!" });

    await Item.create({ itemid, itemname, quantity, category })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the item. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};

exports.getItems = async (req, res) => {
    const { page, limit, category } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const filter = {};
    if (category && ["exclusive", "roblux", "ticket", "ingame", "chest"].includes(category)) {
        filter.category = category;
    }


    const totalDocs = await Item.countDocuments(filter)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the items. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totalPages = Math.ceil(totalDocs / pageOptions.limit);
    const items = await Item.find(filter)
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the items. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const finalData = items.map(item => ({
        id: item._id,
        category: item.category,
        itemid: item.itemid,
        itemname: item.itemname,
        quantity: item.quantity,
        createdAt: moment(item.createdAt).format("YYYY-MM-DD"),
    }));

    return res.json({
        message: "success",
        data: finalData,
        totalPages,
    });
};

exports.editItem = async (req, res) => {
    const { id, itemid, itemname, quantity, category } = req.body;

    if (!id) return res.status(400).json({ message: "bad-request", data: "Please provide an ID!" });

    const updateData = {};

    if (itemname) updateData.itemname = itemname;
    if (itemid) updateData.itemid = itemid;
    if (quantity) {
        if (typeof quantity !== "number") return res.status(400).json({ message: "bad-request", data: "Quantity must be a number!" });
        if (quantity < 0) return res.status(400).json({ message: "bad-request", data: "Quantity cannot be negative!" });
        updateData.quantity = quantity;
    }
    if (category) {
        if (!["exclusive", "roblux", "ticket", "ingame", "chest"].includes(category)) {
            return res.status(400).json({ message: "bad-request", data: "Invalid category! Must be one of: exclusive, roblux, ticket, ingame, chest." });
        }
        updateData.category = category;
    }
    if (Object.keys(updateData).length === 0) return res.status(400).json({ message: "bad-request", data: "Please provide at least one field to update!" });

    const itemExists = await Item.findById(id)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the item data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!itemExists) return res.status(400).json({ message: "bad-request", data: "Item does not exist!" });

    await Item.findByIdAndUpdate(id, { $set: updateData }, { new: true })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the item. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};

exports.deleteItem = async (req, res) => {
    const { id } = req.body;

    if (!id) return res.status(400).json({ message: "bad-request", data: "Please provide an item ID!" });

    const itemExists = await Item.findById(id)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the item data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!itemExists) return res.status(400).json({ message: "bad-request", data: "Item does not exist!" });

    await Item.findByIdAndDelete(id)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem deleting the item. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};