const RobuxCode = require("../models/Robuxcode")
const moment = require("moment");


exports.createrobuxcode = async (req, res) => {

    const { robuxcode, item, name } = req.body

    if (!robuxcode) return res.status(400).json({ message: "bad-request", data: "Please provide a robux code!" })
    if (!item) return res.status(400).json({ message: "bad-request", data: "Please provide an item ID!" })
    if (!name) return res.status(400).json({ message: "bad-request", data: "Please provide a name!" })
        
    const robuxcodeExists = await RobuxCode.findOne({ robuxcode: robuxcode })
    .then (data => data)
    .catch (err => {
        console.log(`There's a problem getting the robux code data. Error ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
    })

    if (robuxcodeExists) return res.status(400).json({ message: "bad-request", data: "Robux code already exists!" })

    await RobuxCode.create({ robuxcode, item, name })
    .then (data => data)
    .catch (err => {
        console.log(`There's a problem creating the robux code. Error ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
    })

    return res.json({ message: "success" })
}

exports.getrobuxcodes = async (req, res) => {
    const { id } = req.user;
    const { page, limit, status, search } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const filter = {};

    if (status && ['to-generate', "to-claim", 'claimed', "approved"].includes(status.toLowerCase())) {
        filter.status = status.toLowerCase();
    }

    if (search) {
        filter.robuxcode = { $regex: search, $options: 'i' };
    }

    try {
        const totalDocs = await RobuxCode.countDocuments(filter);
        const totalPages = Math.ceil(totalDocs / pageOptions.limit);

        const robuxcodes = await RobuxCode.find(filter)
            .populate("item", "itemname itemid")
            .skip(pageOptions.page * pageOptions.limit)
            .limit(pageOptions.limit);

        const finalData = robuxcodes.map(robuxcode => ({
            id: robuxcode._id,
            robuxcode: robuxcode.robuxcode,
            name: robuxcode.name,
            item: robuxcode.item ? {
                id: robuxcode.item._id,
                itemname: robuxcode.item.itemname,
                itemid: robuxcode.item.itemid,
            } : null,
            status: robuxcode.status,
            isUsed: robuxcode.isUsed,
            createdAt: moment(robuxcode.createdAt).format('YYYY-MM-DD'),
        }));

        return res.json({ 
            message: "success", 
            data: finalData,
            totalPages,
        });

    } catch (err) {
        console.error(`Error fetching robux codes: ${err}`);
        return res.status(400).json({
            message: "bad-request",
            data: "There's a problem with the server! Please contact customer support for more details."
        });
    }
};



exports.editrobuxcode = async (req, res) => {

    const { robuxcodeid, robuxcode, item, status, name } = req.body
    

    if (!robuxcodeid) return res.status(400).json({ message: "bad-request", data: "Please provide a robux code id!" })

    const updateData = {}

    if (robuxcode) updateData.robuxcode = robuxcode
    if (item) updateData.item = item
    if (status) updateData.status = status
    if (name) updateData.name = name

    if (updateData.length <= 0) return res.status(400).json({ message: "bad-request", data: "Please provide at least one field to update!" })

    const robuxcodeExists = await RobuxCode.findById(robuxcodeid)
    .then (data => data)
    .catch (err => {
        console.log(`There's a problem getting the robux code data. Error ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
    })

    if(!robuxcodeExists) return res.status(400).json({ message: "bad-request", data: "Robux code does not exist!" })

    await RobuxCode.findByIdAndUpdate({_id: robuxcodeid}, {$set: updateData}, { new: true })
    .then (data => data)
    .catch (err => {
        console.log(`There's a problem updating the robux code. Error ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
    })

    return res.json({ message: "success" })
}

exports.deleterobuxcode = async (req, res) => {

    const { id } = req.user
    const { robuxcodeid } = req.body

    if (!robuxcodeid) return res.status(400).json({ message: "bad-request", data: "Please provide a robux code id!" })

    const robuxcodeExists = await RobuxCode.findById(robuxcodeid)
    .then (data => data)
    .catch (err => {
        console.log(`There's a problem getting the robux code data. Error ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
    })

    if (!robuxcodeExists) return res.status(400).json({ message: "bad-request", data: "Robux code does not exist!" })

    await RobuxCode.findByIdAndDelete({_id: robuxcodeid})
    .then (data => data)
    .catch (err => {
        console.log(`There's a problem deleting the robux code. Error ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
    })

    return res.json({ message: "success" })
}