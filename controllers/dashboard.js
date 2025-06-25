const { Analytics, RedeemedCodeAnalytics } = require("../models/Analytics");
const Code = require("../models/Code");
const RobuxCode = require("../models/Robuxcode");
const Ticket = require("../models/Ticket");
const { daily, weekly, monthly } = require("../utils/graphfilter");
const { startOfYear, endOfYear, startOfWeek, endOfWeek } = require('date-fns');



exports.getcardanalytics = async (req, res) => {
    let totalAnalytics = await Analytics.findOne()
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the analytics data. Error ${err}`)
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
        })

        const expiredCodesCount = await Code.countDocuments({
            expiration: { $lt: new Date() },
            isUsed: false,
            status: { $nin: ["approved", "claimed"] }
        })        
            .then(data => data)
            .catch(err => {
                console.log(`There's a problem getting the expired codes count. Error ${err}`);
                return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
            });
    
    
            if (expiredCodesCount > 0) {
                if (totalAnalytics.totalexpired !== expiredCodesCount) {
                    const diff = expiredCodesCount - (totalAnalytics.totalexpired || 0);
                    totalAnalytics.totalexpired = expiredCodesCount;
                    totalAnalytics.totaltoclaim -= diff;
                }
            }

    const finaldata = {
        totalcodes: totalAnalytics.totaltogenerate + totalAnalytics.totaltoclaim + totalAnalytics.totalclaimed + totalAnalytics.totalexpired + totalAnalytics.totalapproved,  
        totalusedcodes: totalAnalytics.totalclaimed,
        totalunusedcodes: totalAnalytics.totaltoclaim,
        totalexpiredcodes: totalAnalytics.totalexpired,
        totalapproved: totalAnalytics.totalapproved,
    }

    return res.json({ message: "success", data: finaldata })
}

exports.redeemCodeAnalytics = async (req, res) => {
    const { charttype } = req.query;
    const filter = charttype;
    let projectCondition = {};
    let matchCondition = {};
    let groupCondition = {};
    let sortCondition = {};

    if (filter === 'daily') {
        const currentDate = new Date();
        const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(currentDate.setHours(24, 0, 0, 0));

        matchCondition = {
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        };
        projectCondition = {
            hour_created: { $hour: "$createdAt" }
        };
        groupCondition = {
            _id: { hour: "$hour_created" },
            value: { $sum: 1 }
        };
        sortCondition = { "_id.hour": 1 };

    } else if (filter === 'weekly') {
        const currentDate = new Date();
        const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
        const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
        
        matchCondition = {
            createdAt: {
                $gte: startOfWeek,
                $lt: endOfWeek
            }
        };
        projectCondition = {
            day_of_week: { $dayOfWeek: "$createdAt" }
        };
        groupCondition = {
            _id: { day: "$day_of_week" },
            value: { $sum: 1 }
        };
        sortCondition = { "_id.day": 1 };

    } else if (filter === 'monthly') {
        const currentYear = new Date().getFullYear();

        const startOfCurrentYear = startOfYear(new Date(currentYear, 0, 1));
        const endOfCurrentYear = endOfYear(new Date(currentYear, 0, 1));

        matchCondition = {
            createdAt: {
                $gte: startOfCurrentYear,
                $lt: endOfCurrentYear
            }
        };
        projectCondition = {
            month: { $month: "$createdAt" }
        };
        groupCondition = {
            _id: { month: "$month" },
            value: { $sum: 1 }
        };
        sortCondition = { "_id.month": 1 };

    } else if (filter === 'yearly') {
        projectCondition = {
            year_created: { $year: "$createdAt" }
        };
        groupCondition = {
            _id: { year: "$year_created" },
            value: { $sum: 1 }
        };
        sortCondition = { "_id.year": 1 };
    } else {
        return res.status(400).json({ message: "failed", data: "Invalid filter. Use 'daily', 'weekly', 'monthly', or 'yearly'." });
    }

    const data = await RedeemedCodeAnalytics.aggregate([
        { $match: matchCondition },
        { $project: projectCondition },
        { $group: groupCondition },
        { $sort: sortCondition }
    ]);

    console.log(data);
    let finalData = {};

    // Filtering data
    if (filter === 'daily') {
        daily.forEach((time, index) => {
            const matchingEntry = data.find(entry => entry._id.hour === index + 1);
            finalData[time] = matchingEntry ? matchingEntry.value : 0;
        });
    } else if (filter === 'weekly') {
        weekly.forEach((weekday, index) => {
            const matchingEntry = data.find(entry => entry._id.day === index + 1);
            finalData[weekday] = matchingEntry ? matchingEntry.value : 0;
        });
    } else if (filter === 'monthly') {
        monthly.forEach((month, index) => {
            const matchingEntry = data.find(entry => entry._id.month === index + 1);
            finalData[month] = matchingEntry ? matchingEntry.value : 0;
        });
    } else if (filter === 'yearly') {
        const releasedYear = 2024;
        const currentYear = new Date("2030-11-08").getFullYear();

        for (let year = releasedYear; year <= currentYear; year++) {
            const matchingEntry = data.find(entry => entry._id.year === parseInt(year, 10));
            finalData[year] = matchingEntry ? matchingEntry.value : 0;
        }
    } else {
        return res.status(400).json({ message: "failed", data: "Invalid filter. Use 'daily', 'weekly', 'monthly', or 'yearly'." });
    }

    return res.json({ message: "success", data: finalData });
};

exports.redeemCodeStatusAnalytics = async (req, res) => {
    const { charttype } = req.query;
    const filter = charttype;
    let projectCondition = {};
    let matchCondition = {};
    let groupCondition = {};
    let sortCondition = {};

    if (filter === 'daily') {
        const currentDate = new Date();
        const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(currentDate.setHours(24, 0, 0, 0));

        matchCondition = {
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        };
        projectCondition = {
            hour_created: { $hour: "$createdAt" },
            status: 1
        };
        groupCondition = {
            _id: { hour: "$hour_created", status: "$status" },
            value: { $sum: 1 }
        };
        sortCondition = { "_id.hour": 1 };

    } else if (filter === 'weekly') {
        const currentDate = new Date();
        const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
        const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));

        matchCondition = {
            createdAt: {
                $gte: startOfWeek,
                $lt: endOfWeek
            }
        };
        projectCondition = {
            day_of_week: { $dayOfWeek: "$createdAt" },
            status: 1
        };
        groupCondition = {
            _id: { day: "$day_of_week", status: "$status" },
            value: { $sum: 1 }
        };
        sortCondition = { "_id.day": 1 };

    } else if (filter === 'monthly') {
        const currentYear = new Date().getFullYear();

        const startOfCurrentYear = startOfYear(new Date(currentYear, 0, 1));
        const endOfCurrentYear = endOfYear(new Date(currentYear, 0, 1));

        matchCondition = {
            createdAt: {
                $gte: startOfCurrentYear,
                $lt: endOfCurrentYear
            }
        };
        projectCondition = {
            month: { $month: "$createdAt" },
            status: 1
        };
        groupCondition = {
            _id: { month: "$month", status: "$status" },
            value: { $sum: 1 }
        };
        sortCondition = { "_id.month": 1 };

    } else if (filter === 'yearly') {
        projectCondition = {
            year_created: { $year: "$createdAt" },
            status: 1
        };
        groupCondition = {
            _id: { year: "$year_created", status: "$status" },
            value: { $sum: 1 }
        };
        sortCondition = { "_id.year": 1 };
    } else {
        return res.status(400).json({ message: "failed", data: "Invalid filter. Use 'daily', 'weekly', 'monthly', or 'yearly'." });
    }

    const data = await RedeemCode.aggregate([
        { $match: matchCondition },
        { $project: projectCondition },
        { $group: groupCondition },
        { $sort: sortCondition }
    ]);

    let finalData = {
        claimed: {},
        pending: {},
        rejected: {}
    };

    // Filtering data
    if (filter === 'daily') {
        daily.forEach((time, index) => {
            const claimedEntry = data.find(entry => entry._id.hour === index + 1 && entry._id.status === "claimed");
            const pendingEntry = data.find(entry => entry._id.hour === index + 1 && entry._id.status === "pending");
            const rejectedEntry = data.find(entry => entry._id.hour === index + 1 && entry._id.status === "rejected");
            
            finalData.rejected[time] = rejectedEntry ? rejectedEntry.value : 0;
            finalData.claimed[time] = claimedEntry ? claimedEntry.value : 0;
            finalData.pending[time] = pendingEntry ? pendingEntry.value : 0;
        });
    } else if (filter === 'weekly') {
        weekly.forEach((weekday, index) => {
            const claimedEntry = data.find(entry => entry._id.day === index + 1 && entry._id.status === "claimed");
            const pendingEntry = data.find(entry => entry._id.day === index + 1 && entry._id.status === "pending");
            const rejectedEntry = data.find(entry => entry._id.day === index + 1 && entry._id.status === "rejected");
            
            finalData.rejected[weekday] = rejectedEntry ? rejectedEntry.value : 0;
            finalData.claimed[weekday] = claimedEntry ? claimedEntry.value : 0;
            finalData.pending[weekday] = pendingEntry ? pendingEntry.value : 0;
        });
    } else if (filter === 'monthly') {
        monthly.forEach((month, index) => {
            const claimedEntry = data.find(entry => entry._id.month === index + 1 && entry._id.status === "claimed");
            const pendingEntry = data.find(entry => entry._id.month === index + 1 && entry._id.status === "pending");
            const rejectedEntry = data.find(entry => entry._id.month === index + 1 && entry._id.status === "rejected");
            
            finalData.rejected[month] = rejectedEntry ? rejectedEntry.value : 0;
            finalData.claimed[month] = claimedEntry ? claimedEntry.value : 0;
            finalData.pending[month] = pendingEntry ? pendingEntry.value : 0;
        });
    } else if (filter === 'yearly') {
        const releasedYear = 2024;
        const currentYear = new Date("2030-11-08").getFullYear();

        for (let year = releasedYear; year <= currentYear; year++) {
            const claimedEntry = data.find(entry => entry._id.year === parseInt(year, 10) && entry._id.status === "claimed");
            const pendingEntry = data.find(entry => entry._id.year === parseInt(year, 10) && entry._id.status === "pending");
            const rejectedEntry = data.find(entry => entry._id.year === parseInt(year, 10) && entry._id.status === "rejected");
            
            finalData.rejected[year] = rejectedEntry ? rejectedEntry.value : 0;
            finalData.claimed[year] = claimedEntry ? claimedEntry.value : 0;
            finalData.pending[year] = pendingEntry ? pendingEntry.value : 0;
        }
    } else {
        return res.status(400).json({ message: "failed", data: "Invalid filter. Use 'daily', 'weekly', 'monthly', or 'yearly'." });
    }

    return res.json({ message: "success", data: finalData });
};

exports.getregionalAnalytics = async (req, res) => {

    const { charttype = 1} = req.query;

    const data = await Code.aggregate([
    {
        $match: {
            isUsed: true,
            archived: { $ne: true },
            type: 'ticket'
        }
    },
    {
        $addFields: {
        city: {
            $arrayElemAt: [
            { $split: ["$address", ","] },
            Number(charttype) // assuming city is always the 4th part
            ]
        }
        }
    },
    { $group: { _id: "$city", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
    ])
    .then(data => data)
    .catch(err => {
        console.log(`There's a problem getting the regional analytics data. Error ${err}`);
        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
    });


    if (!data || data.length === 0) {
        return res.status(404).json({ message: "not-found", data: "No regional analytics data found." });
    }

    data.sort((a, b) => a._id.localeCompare(b._id));
    const finalData = data.map(item => ({
        area: item._id,
        count: item.count
    }));

    return res.json({ message: "success", data: finalData });

}




exports.gettypeclaimbarchart = async (req, res) => {
    try {
        const analytics = await Analytics.findOne();
        if (!analytics) {
            return res.status(404).json({ message: "not-found", data: "Analytics not found." });
        }

        console.log("Analytics data:", analytics);
        // Build result from analytics fields
        const types = ["robux", "ticket", "exclusive", "chest", "ingame"];
        const result = {};
        types.forEach(type => {
            result[type] = {
                claimed: analytics[`totalclaimed${type}`] || 0,
                unclaimed: analytics[`totalunclaimed${type}`] || 0
            };
        });

        console.log("Type-claim barchart data:", result);
        return res.json({ message: "success", data: result });

        // can i add something here that updates the analytics data?
    } catch (err) {
        console.log("Error generating type-claim barchart:", err);
        return res.status(500).json({ message: "server-error", data: "Failed to generate barchart data." });
    }
};

exports.getpiechartanalytics = async (req, res) => {
    // its just the total of the different types of codes

    const analytics = await Analytics.findOne()
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the analytics data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!analytics) {
        return res.status(404).json({ message: "not-found", data: "Analytics not found." });
    }

    const totalingame = analytics.totalclaimedingame + analytics.totalunclaimedingame;
    const totalrobux = analytics.totalclaimedrobux + analytics.totalunclaimedrobux;
    const totalticket = analytics.totalclaimedticket + analytics.totalunclaimedticket;
    const totalexclusive = analytics.totalclaimedexclusive + analytics.totalunclaimedexclusive;
    const totalchest = analytics.totalclaimedchest + analytics.totalunclaimedchest;

    const result = {
        ingame: {
            claimed: analytics.totalclaimedingame,
            unclaimed: analytics.totalunclaimedingame,
            total: totalingame
        },
        robux: {
            claimed: analytics.totalclaimedrobux,
            unclaimed: analytics.totalunclaimedrobux,
            total: totalrobux
        },
        ticket: {
            claimed: analytics.totalclaimedticket,
            unclaimed: analytics.totalunclaimedticket,
            total: totalticket
        },
        exclusive: {
            claimed: analytics.totalclaimedexclusive,
            unclaimed: analytics.totalunclaimedexclusive,
            total: totalexclusive
        },
        chest: {
            claimed: analytics.totalclaimedchest,
            unclaimed: analytics.totalunclaimedchest,
            total: totalchest
        }
    };

    return res.json({ message: "success", data: result });
}


exports.syncTypeClaimAnalytics = async (req, res) => {
    try {
        // Aggregate counts for each type and isUsed
        const data = await Code.aggregate([
            { $match: { archived: { $ne: true } } },
            {
                $group: {
                    _id: { type: "$type", isUsed: "$isUsed" },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Prepare update object with correct field names
        const update = {};
        data.forEach(item => {
            const type = item._id.type;
            const isUsed = item._id.isUsed;
            if (!type) return; // skip if type is missing
            // Use the correct field name order: totalclaimed{type} / totalunclaimed{type}
            if (isUsed) {
                update[`totalclaimed${type}`] = item.count;
            } else {
                update[`totalunclaimed${type}`] = item.count;
            }
        });

        // Update the Analytics document
        await Analytics.findOneAndUpdate({}, { $set: update }, { upsert: true });

        return res.json({ message: "success", data: update });
    } catch (err) {
        console.log("Error syncing type-claim analytics:", err);
        return res.status(500).json({ message: "server-error", data: "Failed to sync analytics data." });
    }
};