const { TicketType, Ticket } = require("../models/Ticket");
const moment = require("moment");

// #region TICKET TYPE
exports.createTicketType = async (req, res) => {
    const { category, tickettype, ticketname } = req.body;

    if (!category) return res.status(400).json({ message: "bad-request", data: "Please provide a category!" });
    if (!tickettype) return res.status(400).json({ message: "bad-request", data: "Please provide a ticket type!" });
    if (!ticketname) return res.status(400).json({ message: "bad-request", data: "Please provide a ticket name!" });

    const ticketTypeExists = await TicketType.findOne({ category, tickettype, ticketname })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem checking the ticket type. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (ticketTypeExists) return res.status(400).json({ message: "bad-request", data: "Ticket type already exists!" });

    await TicketType.create({ category, tickettype, ticketname })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the ticket type. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};

exports.getTicketTypes = async (req, res) => {
    const { category } = req.query;

    const filter = {};
    if (category) filter.category = category;

    const ticketTypes = await TicketType.find(filter)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem fetching the ticket types. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success", data: ticketTypes });
};


exports.updateTicketType = async (req, res) => {
    const { tickettypeid, category, tickettype, ticketname } = req.body;

    const updateData = {};
    if (category) updateData.category = category;
    if (tickettype) updateData.tickettype = tickettype;
    if (ticketname) updateData.ticketname = ticketname;

    if (Object.keys(updateData).length === 0) return res.status(400).json({ message: "bad-request", data: "Please provide at least one field to update!" });

    const ticketTypeExists = await TicketType.findById(tickettypeid)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem fetching the ticket type. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!ticketTypeExists) return res.status(400).json({ message: "bad-request", data: "Ticket type not found!" });

    await TicketType.findByIdAndUpdate(tickettypeid, { $set: updateData }, { new: true })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the ticket type. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};

exports.deleteTicketType = async (req, res) => {
    const { id } = req.body;

    const ticketTypeExists = await TicketType.findById(id)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem fetching the ticket type. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!ticketTypeExists) return res.status(400).json({ message: "bad-request", data: "Ticket type not found!" });

    await TicketType.findByIdAndDelete(id)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem deleting the ticket type. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};

// #endregion


// #region TICKETS

exports.createTicket = async (req, res) => {
    const { ticketcode, tickettype } = req.body;

    if (!ticketcode) return res.status(400).json({ message: "bad-request", data: "Please provide a ticket code!" });
    if (!tickettype) return res.status(400).json({ message: "bad-request", data: "Please provide a ticket type!" });

    const ticketExists = await Ticket.findOne({ ticketcode })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem checking the ticket data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (ticketExists) return res.status(400).json({ message: "bad-request", data: "Ticket already exists!" });

    await Ticket.create({ ticketcode, tickettype, name: "", email: "", status: "pending", picture: "" })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the ticket. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};

exports.getTickets = async (req, res) => {
    const { page, limit, status } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    };

    const filter = {};
    if (status) filter.status = status;

    const totalDocs = await Ticket.countDocuments(filter)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the tickets. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totalPages = Math.ceil(totalDocs / pageOptions.limit);
    const tickets = await Ticket.find(filter)
        .populate("tickettype")
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the tickets. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const finalData = tickets.map(ticket => ({
        id: ticket._id,
        ticketcode: ticket.ticketcode,
        tickettype: ticket.tickettype.tickettype,
        ticketname: ticket.tickettype.ticketname,
        name: ticket.name,
        email: ticket.email,
        picture: ticket.picture,
        status: ticket.status,
        code: ticket.code || "", 
        createdAt: moment(ticket.createdAt).format("YYYY-MM-DD"),
    }));

    return res.json({
        message: "success",
        data: finalData,
        totalPages,
    });
};

exports.editTicket = async (req, res) => {
    const { ticketid, ticketcode, tickettype, name, email, status } = req.body;
    const { picture } = req.file ? req.file : "";

    if (!ticketid) return res.status(400).json({ message: "bad-request", data: "Please provide a ticket ID!" });

    const updateData = {};
    if (ticketcode) updateData.ticketcode = ticketcode;
    if (tickettype) updateData.tickettype = tickettype;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (status) updateData.status = status;
    if (picture) updateData.picture = picture;

    if (Object.keys(updateData).length === 0) return res.status(400).json({ message: "bad-request", data: "Please provide at least one field to update!" });

    const ticketExists = await Ticket.findById(ticketid)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the ticket data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!ticketExists) return res.status(400).json({ message: "bad-request", data: "Ticket does not exist!" });

    await Ticket.findByIdAndUpdate(ticketid, { $set: updateData }, { new: true })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the ticket. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};

exports.deleteTicket = async (req, res) => {
    const { ticketid } = req.body;

    if (!ticketid) return res.status(400).json({ message: "bad-request", data: "Please provide a ticket ID!" });

    const ticketExists = await Ticket.findById(ticketid)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem getting the ticket data. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!ticketExists) return res.status(400).json({ message: "bad-request", data: "Ticket does not exist!" });

    await Ticket.findByIdAndDelete(ticketid)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem deleting the ticket. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};

// #endregion
