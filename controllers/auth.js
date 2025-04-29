
//  Import all mandatory schemas and delete this if necessary
const Users = require("../models/Users")
const Userdetails = require("../models/Userdetails")


const fs = require('fs')

const bcrypt = require('bcrypt');
const jsonwebtokenPromisified = require('jsonwebtoken-promisified');
const path = require("path");

const privateKey = fs.readFileSync(path.resolve(__dirname, "../keys/private-key.pem"), 'utf-8');
const { default: mongoose } = require("mongoose");

const encrypt = async password => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

exports.authlogin = async(req, res) => {
    const { username, password } = req.body;

    Users.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } })
    .then(async user => {
        if (user && (await user.matchPassword(password))){
            if (user.status != "active"){
                return res.status(401).json({ message: 'failed', data: `Your account had been ${user.status}! Please contact support for more details.` });
            }

            const token = await encrypt(privateKey)

            await Users.findByIdAndUpdate({_id: user._id}, {$set: {token: token}}, { new: true })
            .then(async () => {
                const payload = { id: user._id, username: user.username, status: user.status, token: token, auth: user.auth }


                let jwtoken = ""

                try {
                    jwtoken = await jsonwebtokenPromisified.sign(payload, privateKey, { algorithm: 'RS256' });
                } catch (error) {
                    console.error('Error signing token:', error.message);
                    return res.status(500).json({ error: 'Internal Server Error', data: "There's a problem signing in! Please contact customer support for more details! Error 004" });
                }

                res.cookie('sessionToken', jwtoken, { secure: true, sameSite: 'None' } )
                return res.json({message: "success", data: {
                    auth: user.auth,
                }})
            })
            .catch(err => res.status(400).json({ message: "bad-request2", data: "There's a problem with your account! There's a problem with your account! Please contact customer support for more details."  + err }))
        } else {
            return res.status(401).json({ message: 'failed', data: "Invalid username or password!" });
        }
    })
    .catch(err => res.status(400).json({ message: "bad-request1", data: "There's a problem with your account! There's a problem with your account! Please contact customer support for more details." }))
}

exports.logout = async (req, res) => {
    res.clearCookie('sessionToken', { path: '/' })
    return res.json({message: "success"})
}

exports.changepassword = async (req, res) => {
    const { id } = req.user
    const { newpw } = req.body

    if (!newpw) return res.status(400).json({ message: "bad-request", data: "Please provide a new password!" })

    if (newpw.length < 6) return res.status(400).json({ message: "bad-request", data: "Password must be at least 6 characters!" })

    if (newpw.length > 20) return res.status(400).json({ message: "bad-request", data: "Password must be at most 20 characters!" })

    if (!/[a-z]/.test(newpw)) return res.status(400).json({ message: "bad-request", data: "Password must contain at least one lowercase letter!" })

    if (!/[0-9]/.test(newpw)) return res.status(400).json({ message: "bad-request", data: "Password must contain at least one number!" })
    

    if (newpw.includes(" ")) return res.status(400).json({ message: "bad-request", data: "Password must not contain any spaces!" })

    const hashedPassword = await encrypt(newpw)
    await Users.findByIdAndUpdate({_id: id}, {$set: {password: hashedPassword}}, { new: true })
    .then(data => data)
    .catch(err => {
        console.log("Error while changing password", err)
        return res.status(400).json({ message: "bad-request", data: "There's a problem with your account! Please contact customer support for more details." })
    })

    return res.json({message: "success" })
}