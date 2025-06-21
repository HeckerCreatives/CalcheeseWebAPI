const { authlogin, changepassword, logout, register, ingamelogin } = require("../controllers/auth");
const { protectsuperadmin } = require("../middleware/middleware");

const router = require("express").Router()
// const { authlogin, register, registerstaffs, logout } = require("../controllers/auth")
// const { protectsuperadmin } = require("../middleware/middleware")

router
    .post("/login", authlogin)
    .post("/changepassword", protectsuperadmin, changepassword)
    .get("/logout", logout)
    .post("/register", protectsuperadmin, register)
    .post("/ingamelogin", ingamelogin)
module.exports = router;
