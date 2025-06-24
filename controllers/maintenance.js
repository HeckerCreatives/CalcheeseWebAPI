const Maintenance = require("../models/Maintenance")

exports.getmaintenance = async (req, res) => {
    const {id, username} = req.user

    let mainte = await Maintenance.find()
    .then(data => data)
    .catch(err => {

        console.log(`There's a problem getting maintenance data for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem getting your user details. Please contact customer support." })
    })

    if(!mainte || mainte.length === 0){
        const maintedata = [
            {
                type: "generate",
                value: "0"
            },
            {
                type: "export",
                value: "0"
            },
            {
                type: "delete",
                value: "0"
            },
            {
                type: "edit",
                value: "0"
            }
        ]

        mainte = await Maintenance.insertMany(maintedata)
        .then(data => data)
        .catch(err => {

            console.log(`There's a problem inserting default maintenance data for ${username} Error: ${err}`)

            return res.status(400).json({ message: "bad-request", data: "There's a problem getting your user details. Please contact customer support." })
        })
    }


    const data = {
        maintenancelist: []
    }

    mainte.forEach(valuedata => {
        const {type, value} = valuedata

        data.maintenancelist.push(
            {
                type: type,
                value: value
            }
        )
    })

    return res.json({message: "success", data: data.maintenancelist})
}

exports.changemaintenance = async (req, res) => {
    const {id, username} = req.user
    const {type, value} = req.body

    await Maintenance.findOneAndUpdate({type: type}, {value: value})
    .catch(err => {

        console.log(`There's a problem updating maintenance data for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem getting your user details. Please contact customer support." })
    })

    return res.json({message: "success"})
}

exports.geteventmainte = async (req, res) => {
    const {id, username} = req.user
    const {maintenancetype} = req.query

    const mainte = await Maintenance.findOne({type: maintenancetype})
    .then(data => data)
    .catch(err => {

        console.log(`There's a problem getting maintenance data for ${username} Error: ${err}`)

        return res.status(400).json({ message: "bad-request", data: "There's a problem getting your user details. Please contact customer support." })
    })

    if(!mainte){
        return res.status(400).json({message: "bad-request", data: "Maintenance type not found."})
    }
    const data = {
        type: mainte.type,
        value: mainte.value
    }

    return res.json({message: "success", data: data})
}