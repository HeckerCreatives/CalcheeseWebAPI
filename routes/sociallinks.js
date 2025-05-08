const { getsociallinks, updatesociallink } = require("../controllers/sociallinks");
const { protectsuperadmin } = require("../middleware/middleware");

const router = require("express").Router();

router
 .get("/getsociallinks", getsociallinks)
 .post("/updatesociallink", protectsuperadmin, updatesociallink)

module.exports = router;
