const { authlogin } = require("../controllers/auth");

const router = require("express").Router()
// const { authlogin, register, registerstaffs, logout } = require("../controllers/auth")
// const { protectsuperadmin } = require("../middleware/middleware")

router
    .get("/login", authlogin)

module.exports = router;
