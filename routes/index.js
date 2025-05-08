const routers = app => {
    console.log("Routers are all available");

    app.use("/auth", require("./auth"))
    app.use("/code", require("./code"))
    app.use("/dashboard", require("./dashboard"))
    app.use("/robuxcode", require("./robuxcode"))
    app.use("/section", require("./section"))
    app.use("/sociallinks", require("./sociallinks"))
    app.use("/ticket", require("./ticket"))
    app.use("/uploads", require("./uploads"))
}
module.exports = routers