const { newgeneratecode, getcodes, checkcode, redeemcode, approverejectcode, deletecode, exportCodesCSV, editmultiplecodes } = require('../controllers/code');
const { protectsuperadmin, protectplayer } = require('../middleware/middleware');

const upload = require("../middleware/uploadpics")
const uploadimg = upload.single("picture")

const router = require('express').Router();

router
 .post("/generatecode", protectsuperadmin, newgeneratecode)
 .get("/getcodes", protectsuperadmin, getcodes)
 .post("/redeemcode", function (req, res, next) {
    uploadimg(req, res, function(err){
        if(err) {
            return res.status(400).send({ message: "failed", data: err.message})
        }

        next()
    })}, redeemcode)
 .post("/approverejectcode", protectsuperadmin, approverejectcode)
 .post("/deletecode", protectsuperadmin, deletecode)
 .get('/export-csv', exportCodesCSV)
 .post("/editmultiplecodes", protectsuperadmin, editmultiplecodes)
 .post("/checkcode", protectplayer, checkcode)

module.exports = router;