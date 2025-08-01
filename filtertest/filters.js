const Code = require("../models/Code");
const { default: mongoose } = require("mongoose");

exports.getcodeswithfilter = async (req, res) => {
    const {manufacturer, rewardtype, rarity, items, status} = req.query;

    // const pageOptions = {
    //     page: parseInt(page) || 0,
    //     limit: parseInt(limit) || 10,
    // };

    const filters = {
        manufacturer: 'hbyx2',
        type: 'chest',
        rarity: 'common',
        status: 'to-claim'
    };

    const result = await Code.aggregate([
    { $match: filters },
    { $group: { _id: null, total: { $sum: 1 } } }
    ]).allowDiskUse(true);

    const count = result[0]?.total || 0;

    return res.json({message: "success", data: count})
}