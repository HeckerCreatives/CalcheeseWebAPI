const { getcardanalytics, redeemCodeAnalytics, redeemCodeStatusAnalytics, getregionalAnalytics, gettypeclaimbarchart, syncTypeClaimAnalytics, getpiechartanalytics } = require("../controllers/dashboard")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/getcardanalytics", protectsuperadmin, getcardanalytics)
 .get("/getredeemcodeanalytics", protectsuperadmin, redeemCodeAnalytics)
 .get("/getredeemcodeanalyticsstatus", protectsuperadmin, redeemCodeStatusAnalytics)
 .get("/getregionalanlytics", protectsuperadmin, getregionalAnalytics)
module.exports = router