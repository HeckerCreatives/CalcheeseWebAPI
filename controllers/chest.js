const Chest = require("../models/Chest");
const moment = require("moment");

// Create Chest
exports.createchest = async (req, res) => {
    const { chestid, chestname, itemid } = req.body;

    if (!chestid) return res.status(400).json({ message: "bad-request", data: "Please provide a chest id!" });
    if (!chestname) return res.status(400).json({ message: "bad-request", data: "Please provide a chest name!" });

    const chestExists = await Chest.findOne({ chestid })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem checking the chest data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (chestExists) return res.status(400).json({ message: "bad-request", data: "Chest already exists!" });

    await Chest.create({ chestid, chestname, itemid })
        .then(data => res.json({ message: "success" }))
        .catch(err => {
            console.log(`There's a problem creating the chest. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};

// Get Chests
exports.getchests = async (req, res) => {
    const { page, limit } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const totalDocs = await Chest.countDocuments()
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the chests. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totalPages = Math.ceil(totalDocs / pageOptions.limit);

    const chests = await Chest.find()
        .populate("itemid", "itemname itemid")
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the chests. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const finalData = chests.map(chest => ({
        id: chest._id,
        chestid: chest.chestid,
        chestname: chest.chestname,
        items: chest.itemid.map(item => ({
            id: item._id,
            itemname: item.itemname,
            itemid: item.itemid,
        })),
        createdAt: moment(chest.createdAt).format("YYYY-MM-DD"),
    }));

    return res.json({
        message: "success",
        data: finalData,
        totalPages,
    });
};

// Update Chest
exports.updatechest = async (req, res) => {
    const { id, chestid, chestname, itemid } = req.body;

    if (!id) return res.status(400).json({ message: "bad-request", data: "Please provide an ID!" });

    const updateData = {};
    if (chestid) updateData.chestid = chestid;
    if (chestname) updateData.chestname = chestname;
    if (itemid) updateData.itemid = itemid;

    if (Object.keys(updateData).length === 0) return res.status(400).json({ message: "bad-request", data: "Please provide at least one field to update!" });

    const chestExists = await Chest.findById(id)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the chest data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!chestExists) return res.status(400).json({ message: "bad-request", data: "Chest does not exist!" });

    await Chest.findByIdAndUpdate(id, { $set: updateData }, { new: true })
        .then(data => res.json({ message: "success", data }))
        .catch(err => {
            console.log(`There's a problem updating the chest. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};

// Delete Chest
exports.deletechest = async (req, res) => {
    const { id } = req.body;

    if (!id) return res.status(400).json({ message: "bad-request", data: "Please provide a chest ID!" });

    const chestExists = await Chest.findById(id)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the chest data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!chestExists) return res.status(400).json({ message: "bad-request", data: "Chest does not exist!" });

    await Chest.findByIdAndDelete(id)
        .then(() => res.json({ message: "success" }))
        .catch(err => {
            console.log(`There's a problem deleting the chest. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });
};