const router = require('express').Router();
const { getchests, createchest, updatechest, deletechest, getChestCodeAnalytics } = require('../controllers/chest');
const { protectsuperadmin } = require('../middleware/middleware');

router
    .post("/createchest", protectsuperadmin, createchest)
    .get("/getchests", protectsuperadmin, getchests)
    .get("/getchestcodeanalytics", protectsuperadmin, getChestCodeAnalytics)
    .post("/editchest", protectsuperadmin, updatechest)
    .post("/deletechest", protectsuperadmin, deletechest)

module.exports = router;