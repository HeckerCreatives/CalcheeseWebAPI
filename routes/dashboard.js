const { getcardanalytics, redeemCodeAnalytics, redeemCodeStatusAnalytics, getregionalAnalytics, getCodeDistribution, getCodeRedemption } = require("../controllers/dashboard")
const { protectsuperadmin } = require("../middleware/middleware")

const router = require("express").Router()

router
 .get("/getcardanalytics", protectsuperadmin, getcardanalytics)
 .get("/getredeemcodeanalytics", protectsuperadmin, redeemCodeAnalytics)
 .get("/getredeemcodeanalyticsstatus", protectsuperadmin, redeemCodeStatusAnalytics)
 .get("/getregionalanlytics", protectsuperadmin, getregionalAnalytics)
 .get("/getcodedistribution", protectsuperadmin, getCodeDistribution)
 .get("/getcoderedemption", protectsuperadmin, getCodeRedemption)
module.exports = router