const { createrobuxcode, getrobuxcodes, editrobuxcode, deleterobuxcode, generateTestRobuxCodes } = require('../controllers/robuxcode');
const { protectsuperadmin } = require('../middleware/middleware');

const upload = require("../middleware/uploadpics")
const uploadimg = upload.single("picture")

const router = require('express').Router();

router
 .post("/createrobuxcode", protectsuperadmin, createrobuxcode)
 .post("/generaterobuxcode", generateTestRobuxCodes)
 .get("/getrobuxcodes", protectsuperadmin, getrobuxcodes)
 .post("/editrobuxcode", protectsuperadmin,function (req, res, next) {
    uploadimg(req, res, function(err){
        if(err) {
            return res.status(400).send({ message: "failed", data: err.message})
        }

        next()
    })}, editrobuxcode)
 .post("/deleterobuxcode", protectsuperadmin, deleterobuxcode)

module.exports = router;