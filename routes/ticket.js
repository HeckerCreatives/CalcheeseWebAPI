const { getTicketTypes, createTicketType, updateTicketType, deleteTicketType, getTickets, createTicket, editTicket, deleteTicket } = require("../controllers/ticket");
const { protectsuperadmin } = require("../middleware/middleware");

const upload = require("../middleware/uploadpics")
const uploadimg = upload.single("picture")

const router = require("express").Router();

router
 .get("/gettickettypes", protectsuperadmin, getTicketTypes)
 .post("/createtickettype", protectsuperadmin, createTicketType)
 .post("/edittickettype", protectsuperadmin, updateTicketType)
 .post("/deletetickettype", protectsuperadmin, deleteTicketType)

 .get("/gettickets", protectsuperadmin, getTickets)
 .post("/createticket", protectsuperadmin, createTicket)
 .post("/editticket", protectsuperadmin, function (req, res, next) {
    uploadimg(req, res, function(err){
        if(err) {
            return res.status(400).send({ message: "failed", data: err.message})
        }

        next()
    })}, editTicket)
.post("/deleteticket", protectsuperadmin, deleteTicket)

module.exports = router;