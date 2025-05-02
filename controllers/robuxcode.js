const RobuxCode = require("../models/Robuxcode")
const moment = require("moment");


exports.createrobuxcode = async (req, res) => {

    const { robuxcode, amount } = req.body

    if (!robuxcode) return res.status(400).json({ message: "bad-request", data: "Please provide a robux code!" })
    if (!amount) return res.status(400).json({ message: "bad-request", data: "Please provide an amount!" })
    if (amount < 0) return res.status(400).json({ message: "bad-request", data: "Amount must be at least 0!" })

    const robuxcodeExists = await RobuxCode.findOne({ robuxcode: robuxcode })
    .then (data => data)
    .catch (err => {
        console.log(`There's a problem getting the robux code data. Error ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
    })

    if (robuxcodeExists) return res.status(400).json({ message: "bad-request", data: "Robux code already exists!" })

    await RobuxCode.create({ robuxcode, amount, status: "pending", name: "", email: "", picture: "" })
    .then (data => data)
    .catch (err => {
        console.log(`There's a problem creating the robux code. Error ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
    })

    return res.json({ message: "success" })
}

// exports.getrobuxcodes = async (req, res) => {
//     const { id } = req.user
//     const { page , limit, status } = req.query

//     const pageOptions = {
//         page: parseInt(page) || 0,
//         limit: parseInt(limit) || 10,
//     }

//     const filter = {}
//     if (status) filter.status = status

//     const totalDocs = await RobuxCode.countDocuments(filter)
//         .then(data => data)
//         .catch(err => {
//             console.log(`There's a problem getting the robux codes. Error ${err}`)
//             return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
//         })

    
//     const totalPages = Math.ceil(totalDocs / pageOptions.limit)
//     const robuxcodes = await RobuxCode.find(filter)
//         .skip(pageOptions.page * pageOptions.limit)
//         .limit(pageOptions.limit)
//         .then(data => data)
//         .catch(err => {
//             console.log(`There's a problem getting the robux codes. Error ${err}`)
//             return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." })
//         })


//     const finalData = []

//     robuxcodes.forEach(robuxcode => {
//         finalData.push({
//             id: robuxcode._id,
//             robuxcode: robuxcode.robuxcode,
//             name: robuxcode.name,
//             email: robuxcode.email,
//             picture: robuxcode.picture,
//             code: robuxcode.code || "",
//             amount: robuxcode.amount,
//             status: robuxcode.status,
//             createdAt: moment(robuxcode.createdAt).format('YYYY-MM-DD'),
//         })
//     })

//     return res.json({ 
//         message: "success", 
//         data: finalData,
//         totalPages: totalPages,
//     })
// }

exports.getrobuxcodes = async (req, res) => {
    const { id } = req.user;
    const { page, limit, status, search } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const filter = {};

    if (status && ['pending', 'claimed'].includes(status.toLowerCase())) {
        filter.status = status.toLowerCase();
    }

    if (search) {
        filter.robuxcode = { $regex: search, $options: 'i' };
    }

    try {
        const totalDocs = await RobuxCode.countDocuments(filter);
        const totalPages = Math.ceil(totalDocs / pageOptions.limit);

        const robuxcodes = await RobuxCode.find(filter)
            .skip(pageOptions.page * pageOptions.limit)
            .limit(pageOptions.limit);

        const finalData = robuxcodes.map(robuxcode => ({
            id: robuxcode._id,
            robuxcode: robuxcode.robuxcode,
            name: robuxcode.name,
            email: robuxcode.email,
            picture: robuxcode.picture,
            code: robuxcode.code || "",
            amount: robuxcode.amount,
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

    const { id } = req.user
    const { robuxcodeid, robuxcode, amount, status, name, email } = req.body
    
    const { picture } = req.file ? req.file : ""

    console.log(req.body)

    if (!robuxcodeid) return res.status(400).json({ message: "bad-request", data: "Please provide a robux code id!" })

    const updateData = {}

    if (robuxcode) updateData.robuxcode = robuxcode
    if (amount) updateData.amount = amount
    if (status) updateData.status = status
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (picture) updateData.picture = picture
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