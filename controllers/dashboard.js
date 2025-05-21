const Code = require("../models/Code");
const { daily, weekly, monthly } = require("../utils/graphfilter");
const { startOfYear, endOfYear, startOfWeek, endOfWeek } = require('date-fns');



exports.getcardanalytics = async (req, res) => {

    const { id } = req.user


    const totalcodes = await Code.countDocuments({})
        .then(data => data)
        .catch(err => {
            console.log('Error fetching total codes:', err.message);

            res.status(400).json({ message: "bad-request", data: "There's a problem with your account! Please contact customer support for more details."  })
        })

    const totalusedcodes = await Code.countDocuments({ isUsed: true })
        .then(data => data)
        .catch(err => {
            console.log('Error fetching total used codes:', err.message);

            res.status(400).json({ message: "bad-request", data: "There's a problem with your account! Please contact customer support for more details."  })
        })

    const totalunusedcodes = await Code.countDocuments({ isUsed: false })
        .then(data => data)
        .catch(err => {
            console.log('Error fetching total unused codes:', err.message);

            res.status(400).json({ message: "bad-request", data: "There's a problem with your account! Please contact customer support for more details."  })
        })

    const totalexpiredcodes = await Code.countDocuments({ expiration: { $lt: new Date() } })
        .then(data => data)
        .catch(err => {
            console.log('Error fetching total expired codes:', err.message);

            res.status(400).json({ message: "bad-request", data: "There's a problem with your account! Please contact customer support for more details."  })
        })

    const finaldata = {
        totalcodes: totalcodes,
        totalusedcodes: totalusedcodes,
        totalunusedcodes: totalunusedcodes,
        totalexpiredcodes: totalexpiredcodes
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

    // const data = await RedeemCode.aggregate([
    //     { $match: matchCondition },
    //     { $project: projectCondition },
    //     { $group: groupCondition },
    //     { $sort: sortCondition }
    // ]);

    // let finalData = {};

    // // Filtering data
    // if (filter === 'daily') {
    //     daily.forEach((time, index) => {
    //         const matchingEntry = data.find(entry => entry._id.hour === index + 1);
    //         finalData[time] = matchingEntry ? matchingEntry.value : 0;
    //     });
    // } else if (filter === 'weekly') {
    //     weekly.forEach((weekday, index) => {
    //         const matchingEntry = data.find(entry => entry._id.day === index + 1);
    //         finalData[weekday] = matchingEntry ? matchingEntry.value : 0;
    //     });
    // } else if (filter === 'monthly') {
    //     monthly.forEach((month, index) => {
    //         const matchingEntry = data.find(entry => entry._id.month === index + 1);
    //         finalData[month] = matchingEntry ? matchingEntry.value : 0;
    //     });
    // } else if (filter === 'yearly') {
    //     const releasedYear = 2024;
    //     const currentYear = new Date("2030-11-08").getFullYear();

    //     for (let year = releasedYear; year <= currentYear; year++) {
    //         const matchingEntry = data.find(entry => entry._id.year === parseInt(year, 10));
    //         finalData[year] = matchingEntry ? matchingEntry.value : 0;
    //     }
    // } else {
    //     return res.status(400).json({ message: "failed", data: "Invalid filter. Use 'daily', 'weekly', 'monthly', or 'yearly'." });
    // }

    // return res.json({ message: "success", data: finalData });
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