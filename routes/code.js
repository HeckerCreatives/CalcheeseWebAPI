const { generatecode, getcodehistory, redeemcode, getRedeemCodeHistory } = require('../controllers/code');
const { protectsuperadmin } = require('../middleware/middleware');

const upload = require("../middleware/uploadpics")
const uploadimg = upload.single("picture")

const router = require('express').Router();

router
 .post("/generatecode", protectsuperadmin, generatecode)
 .get("/getcodehistory", protectsuperadmin, getcodehistory)
 .post("/redeemcode", function (req, res, next) {
    uploadimg(req, res, function(err){
        if(err) {
            return res.status(400).send({ message: "failed", data: err.message})
        }

        next()
    })}, redeemcode)
 .get("/getredeemhistory", protectsuperadmin, getRedeemCodeHistory)

module.exports = router;