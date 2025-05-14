const router = require('express').Router();
const { getchests, createchest, updatechest, deletechest } = require('../controllers/chest');
const { protectsuperadmin } = require('../middleware/middleware');

router
    .post("/createchest", protectsuperadmin, createchest)
    .get("/getchests", protectsuperadmin, getchests)
    .post("/editchest", protectsuperadmin, updatechest)
    .post("/deletechest", protectsuperadmin, deletechest)

module.exports = router;