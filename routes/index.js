const routers = app => {
    console.log("Routers are all available");

    app.use("/auth", require("./auth"))
    app.use("/code", require("./code"))
    app.use("/dashboard", require("./dashboard"))
    app.use("/uploads", require("./uploads"))
}
module.exports = routers