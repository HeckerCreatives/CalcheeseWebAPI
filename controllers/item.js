const { Item } = require("../models/Code");

exports.createItem = async (req, res) => {
    const { itemcode, name, type,  amount } = req.body;

    if (!itemcode) return res.status(400).json({ message: "bad-request", data: "Please provide an item code!" });
    if (!amount) return res.status(400).json({ message: "bad-request", data: "Please provide an amount!" });
    if (amount < 0) return res.status(400).json({ message: "bad-request", data: "Amount must be at least 0!" });
    if (!type) return res.status(400).json({ message: "bad-request", data: "Please provide an item type!" });
    if (!name) return res.status(400).json({ message: "bad-request", data: "Please provide an item name!" });

    const itemExists = await Item.findOne({ itemcode })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem checking the item data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (itemExists) return res.status(400).json({ message: "bad-request", data: "Item already exists!" });

    await Item.create({ itemcode, amount, itemname: name, itemtype: type, status: "to-generate", name: "", email: "", picture: "" })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the item. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};

exports.getItems = async (req, res) => {
    const { page, limit, status } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const filter = {};
    if (status) filter.status = status;

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
        itemcode: item.itemcode,
        itemname: item.itemname,
        itemtype: item.itemtype,
        name: item.name,
        email: item.email,
        picture: item.picture,
        amount: item.amount,
        status: item.status,
        createdAt: moment(item.createdAt).format("YYYY-MM-DD"),
    }));

    return res.json({
        message: "success",
        data: finalData,
        totalPages,
    });
};

exports.editItem = async (req, res) => {
    const { itemid, itemcode, itemname, itemtype, amount, status, name, email } = req.body;
    const { picture } = req.file ? req.file : "";

    if (!itemid) return res.status(400).json({ message: "bad-request", data: "Please provide an item ID!" });

    const updateData = {};
    if (itemcode) updateData.itemcode = itemcode;
    if (amount) updateData.amount = amount;
    if (status) updateData.status = status;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (picture) updateData.picture = picture;
    if (itemname) updateData.itemname = itemname;
    if (itemtype) updateData.itemtype = itemtype;

    if (Object.keys(updateData).length === 0) return res.status(400).json({ message: "bad-request", data: "Please provide at least one field to update!" });

    const itemExists = await Item.findById(itemid)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the item data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!itemExists) return res.status(400).json({ message: "bad-request", data: "Item does not exist!" });

    await Item.findByIdAndUpdate(itemid, { $set: updateData }, { new: true })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the item. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};

exports.deleteItem = async (req, res) => {
    const { itemid } = req.body;

    if (!itemid) return res.status(400).json({ message: "bad-request", data: "Please provide an item ID!" });

    const itemExists = await Item.findById(itemid)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the item data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!itemExists) return res.status(400).json({ message: "bad-request", data: "Item does not exist!" });

    await Item.findByIdAndDelete(itemid)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem deleting the item. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};