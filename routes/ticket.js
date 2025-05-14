const { createTicket, getTickets, updateTicket, deleteTicket } = require("../controllers/ticket");
const { protectsuperadmin } = require("../middleware/middleware");

const upload = require("../middleware/uploadpics")
const uploadimg = upload.single("picture")

const router = require("express").Router();

router
    .post("/createticket", protectsuperadmin, createTicket)
    .post("/deleteticket", protectsuperadmin, deleteTicket)
    .post("/editticket", protectsuperadmin, updateTicket)
    .get("/gettickets", protectsuperadmin, getTickets)

module.exports = router;