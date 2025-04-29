const { default: mongoose } = require("mongoose")
const Users = require("../models/Users")
const Userdetails = require("../models/Userdetails")
const Chest = require("../models/Chest")

exports.initialize = async () => {
    
    console.log("STARTING SERVER INITIALIZATION")

    const superadmin = await Users.find()
    .then (data => data)
    .catch (err => {
        console.log(`There's a problem getting the superadmin data for init. Error ${err}`)

        return
    })


    if (superadmin.length <= 0){
       const sa = await Users.create({ username: "cheesygod", password: "Q6SAZ9SNHAK", token: "", bandate: "", status: "active", auth: "superadmin"})

        await Userdetails.create({ owner: sa._id,  firstname: "Cheesy", lastname: "god", initial: "TSA", contactno: "12312312312"})
        .catch(err => {
            console.log(`There's a problem creating user details for superadmin. Error ${err}`)

            return res.status(400).json({message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details."})
        });

    }

    // INITIALIZE CHEST TYPES

    const chesttypes = await Chest.find()
    .then (data => data)
    .catch (err => {
        console.log(`There's a problem getting the chest types data for init. Error ${err}`)

        return
    })

    if (chesttypes.length <= 0){

        const chests = [
            {
                chestname: "Common Box",
                chesttype: "common",
            },
            {
                chestname: "Elite Box",
                chesttype: "elite",
            },            
            {
                chestname: "Rare Box",
                chesttype: "rare",
            },
            {
                chestname: "Epic Box",
                chesttype: "epic",
            },
        ]
        await Chest.insertMany(chests)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the default chest type. Error ${err}`)

            return res.status(400).json({message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details."})
        });

        console.log("Default chest types created")
    }

    console.log("DONE SERVER INITIALIZATION")
}