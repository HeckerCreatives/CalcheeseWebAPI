const {
    createimagesection,
    getimagesections,
    updateimagesection,
    deleteimagesection,
    createwhatsnewsection,
    getwhatsnewsections,
    updatewhatsnewsection,
    deletewhatsnewsection,
    createpromocodesection,
    getpromocodesections,
    updatepromocodesection,
    deletepromocodesection
} = require('../controllers/section');
const { protectsuperadmin } = require('../middleware/middleware');

const upload = require("../middleware/uploadpics");
const uploadimg = upload.single("image");

const router = require('express').Router();

// Image Section Routes

router
    .post("/createimagesection", protectsuperadmin, function (req, res, next) {
    uploadimg(req, res, function (err) {
        if (err) {
            return res.status(400).send({ message: "failed", data: err.message });
        }
        next();
    });
}, createimagesection)
.get("/getimagesections", protectsuperadmin, getimagesections)
.post("/updateimagesection", protectsuperadmin, function (req, res, next) {
    uploadimg(req, res, function (err) {
        if (err) {
            return res.status(400).send({ message: "failed", data: err.message });
        }
        next();
    });
}, updateimagesection)
.post("/deleteimagesection", protectsuperadmin, deleteimagesection)

.post("/createwhatsnewsection", protectsuperadmin, function (req, res, next) {
    uploadimg(req, res, function (err) {
        if (err) {
            return res.status(400).send({ message: "failed", data: err.message });
        }
        next();
    });
}, createwhatsnewsection)
.get("/getwhatsnewsections", protectsuperadmin, getwhatsnewsections)
.post("/updatewhatsnewsection", protectsuperadmin, function (req, res, next) {
    uploadimg(req, res, function (err) {
        if (err) {
            return res.status(400).send({ message: "failed", data: err.message });
        }
        next();
    });
}, updatewhatsnewsection)
.post("/deletewhatsnewsection", protectsuperadmin, deletewhatsnewsection)

// PromoCode Section Routes
.post("/createpromocodesection", protectsuperadmin, createpromocodesection)
.get("/getpromocodesections", protectsuperadmin, getpromocodesections)
.post("/updatepromocodesection", protectsuperadmin, updatepromocodesection)
.post("/deletepromocodesection", protectsuperadmin, deletepromocodesection)

module.exports = router;