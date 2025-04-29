const { getcardanalytics, redeemCodeAnalytics, redeemCodeStatusAnalytics } = require("../controllers/dashboard")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/getcardanalytics", protectsuperadmin, getcardanalytics)
 .get("/getredeemcodeanalytics", protectsuperadmin, redeemCodeAnalytics)
 .get("/getredeemcodeanalyticsstatus", protectsuperadmin, redeemCodeStatusAnalytics)
module.exports = router