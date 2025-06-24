const routers = app => {
    console.log("Routers are all available");

    app.use("/auth", require("./auth"))
    app.use("/chest", require("./chest"))
    app.use("/code", require("./code"))
    app.use("/dashboard", require("./dashboard"))
    app.use("/item", require("./item"))
    app.use("/maintenance", require("./maintenance"))
    app.use("/robuxcode", require("./robuxcode"))
    app.use("/section", require("./section"))
    app.use("/sociallinks", require("./sociallinks"))
    app.use("/ticket", require("./ticket"))
    app.use("/uploads", require("./uploads"))
}
module.exports = routers