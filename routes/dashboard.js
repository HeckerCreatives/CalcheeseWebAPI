const { getcardanalytics, redeemCodeAnalytics, redeemCodeStatusAnalytics, getregionalAnalytics, gettypeclaimbarchart, syncTypeClaimAnalytics, getpiechartanalytics, syncAllAnalytics, redeemCodeStatusTypesAnalytics } = require("../controllers/dashboard")
const { getcodeswithfilter } = require("../filtertest/filters")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/getcardanalytics", protectsuperadmin, getcardanalytics)
 .get("/getcodeswithfilter", getcodeswithfilter)
 .get("/getredeemcodeanalytics", protectsuperadmin, redeemCodeAnalytics)
 .get("/getredeemcodeanalyticsstatus", protectsuperadmin, redeemCodeStatusAnalytics)
 .get("/getredeemcodeanalyticsstatustypes", protectsuperadmin, redeemCodeStatusTypesAnalytics)
 .get("/getregionalanlytics", protectsuperadmin, getregionalAnalytics)
 .get("/gettypeclaimbarchart", protectsuperadmin, gettypeclaimbarchart)
 .get("/getpiechartanalytics", protectsuperadmin, getpiechartanalytics)
 .post("/syncTypeClaimAnalytics", syncTypeClaimAnalytics)
 .post("/syncAllAnalytics", syncAllAnalytics)
module.exports = router