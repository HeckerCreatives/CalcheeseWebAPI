const Code = require("../models/Code");
const { default: mongoose } = require("mongoose");

exports.getcodeswithfilter = async (req, res) => {
    const {manufacturer, rewardtype, rarity, items, status} = req.query;

    const filters = {
        manufacturer: 'hbyx',
        type: 'ingame',
        rarity: 'common',
        items: new mongoose.Types.ObjectId("6867da36fd0f989575d2fddf"),
        status: 'to-claim'
    };

    const result = await Code.aggregate([
    { $match: filters },
    { $group: { _id: null, total: { $sum: 1 } } }
    ]).allowDiskUse(true); // helps with memory if needed

    const count = result[0]?.total || 0;

    return res.json({message: "success", data: count})
}