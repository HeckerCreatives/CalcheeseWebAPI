const Item = require("../models/Item");
const moment = require("moment");

exports.createItem = async (req, res) => {
    const { itemname, quantity, category, rarity } = req.body;

    if (!itemname) return res.status(400).json({ message: "bad-request", data: "Please provide an item name!" });
    if (quantity && typeof quantity !== "number") return res.status(400).json({ message: "bad-request", data: "Quantity must be a number!" });
    if (quantity && quantity < 0) return res.status(400).json({ message: "bad-request", data: "Quantity cannot be negative!" });
    if (category && !["exclusive", "robux", "ticket", "ingame", "chest"].includes(category)) {
        return res.status(400).json({ message: "bad-request", data: "Invalid category! Must be one of: exclusive, roblux, ticket, ingame, chest." });
    }
    if (rarity && !["common", "uncommon", "rare", "epic", "legendary"].includes(rarity)) {
        return res.status(400).json({ message: "bad-request", data: "Invalid rarity! Must be one of: common, uncommon, rare, epic, legendary." });
    }

    await Item.create({ itemname, quantity, category, rarity })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the item. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};

exports.getItems = async (req, res) => {
    const { page, limit, category, rarity } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const filter = {};
    if (category && ["exclusive", "robux", "ticket", "ingame", "chest"].includes(category)) {
        filter.category = category;
    }
    if (rarity && ["common", "uncommon", "rare", "epic", "legendary"].includes(rarity)) {
        filter.rarity = rarity;
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

    const rarityOrder = {
        'common': 1,
        'uncommon': 2,
        'rare': 3,
        'epic': 4,
        'legendary': 5,
        'none': 0
    };

    const finalData = items
        .sort((a, b) => {
            // First sort by category
            if (a.category < b.category) return -1;
            if (a.category > b.category) return 1;
            
            // Then sort by rarity using the defined order
            return (rarityOrder[a.rarity || 'none'] || 0) - (rarityOrder[b.rarity || 'none'] || 0);
        })
        .map(item => ({
            id: item._id,
            category: item.category,
            rarity: item.rarity || "none",
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
    const { id, itemname, quantity, category, rarity } = req.body;

    if (!id) return res.status(400).json({ message: "bad-request", data: "Please provide an ID!" });

    const updateData = {};

    if (itemname) updateData.itemname = itemname;
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
    if (rarity) {
        if (!["common", "uncommon", "rare", "epic", "legendary"].includes(rarity)) {
            return res.status(400).json({ message: "bad-request", data: "Invalid rarity! Must be one of: common, uncommon, rare, epic, legendary." });
        }
        updateData.rarity = rarity;
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

exports.deletemultipleitems = async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "bad-request", data: "Please provide at least one item ID!" });
    }

    // Check if all items exist
    const foundItems = await Item.find({ _id: { $in: ids } }).select('_id').lean();
    const foundIds = foundItems.map(item => item._id.toString());
    const notFound = ids.filter(id => !foundIds.includes(id));

    if (notFound.length > 0) {
        return res.status(400).json({ message: "bad-request", data: `Items not found: ${notFound.join(', ')}` });
    }

    // Delete all items
    await Item.deleteMany({ _id: { $in: ids } })
        .catch(err => {
            console.log(`There's a problem deleting the items. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
}