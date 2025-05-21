const  Ticket = require("../models/Ticket");
const moment = require("moment");

// #region TICKET TYPE
exports.createTicket = async (req, res) => {
    const { category, tickettype, ticketname, ticketid, item } = req.body;

    if (!category) return res.status(400).json({ message: "bad-request", data: "Please provide a category!" });
    if (!tickettype) return res.status(400).json({ message: "bad-request", data: "Please provide a ticket type!" });
    if (!ticketname) return res.status(400).json({ message: "bad-request", data: "Please provide a ticket name!" });
    if (!item) return res.status(400).json({ message: "bad-request", data: "Please provide an item!" });
    if (!ticketid) return res.status(400).json({ message: "bad-request", data: "Please provide an ticket id!" });
    if (item.length === 0) return res.status(400).json({ message: "bad-request", data: "Please provide at least one item!" });

    const ticketTypeExists = await Ticket.findOne({ ticketid: ticketid })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem checking the ticket type. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (ticketTypeExists) return res.status(400).json({ message: "bad-request", data: "Ticket already exists!" });

    await Ticket.create({ ticketid, category, tickettype, ticketname, item, status: "to-generate" })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem creating the ticket type. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};

exports.getTickets = async (req, res) => {
    const { category, page, limit } = req.query;

    const pageOptions = {
        page: parseInt(page) || 0,
        limit: parseInt(limit) || 10,
    }

    const filter = {};
    if (category) filter.category = category;

    const ticketTypes = await Ticket.find(filter)
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .populate("item", "itemname itemid")
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem fetching the ticket types. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totalCount = await Ticket.countDocuments(filter)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem counting the ticket types. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    const totalPages = Math.ceil(totalCount / pageOptions.limit);

    const finalData = ticketTypes.map(ticket => ({
        id: ticket._id,
        ticketid: ticket.ticketid,
        category: ticket.category,
        tickettype: ticket.tickettype,
        ticketname: ticket.ticketname,
        item: ticket.item,
        status: ticket.status,
        createdAt: moment(ticket.createdAt).format("YYYY-MM-DD"),
    }));

    return res.json({ message: "success", data: finalData, totalpages: totalPages });
};


exports.updateTicket = async (req, res) => {
    const { id, ticketid, category, tickettype, ticketname, item } = req.body;

    const updateData = {};
    if (category) updateData.category = category;
    if (tickettype) updateData.tickettype = tickettype;
    if (ticketname) updateData.ticketname = ticketname;
    if (ticketid) updateData.ticketid = ticketid;
    if (item) updateData.item = item;

    if (Object.keys(updateData).length === 0) return res.status(400).json({ message: "bad-request", data: "Please provide at least one field to update!" });

    const ticketUsed = await Ticket.findOne({ ticketid: ticketid, _id: { $ne: id } });

    if (ticketUsed) return res.status(400).json({ message: "bad-request", data: "Ticket ID already exists!" });

    const ticketTypeExists = await Ticket.findById(id)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem fetching the ticket type. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!ticketTypeExists) return res.status(400).json({ message: "bad-request", data: "Ticket type not found!" });

    await Ticket.findByIdAndUpdate(id, { $set: updateData }, { new: true })
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem updating the ticket type. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};

exports.deleteTicket = async (req, res) => {
    const { id } = req.body;

    const ticketTypeExists = await Ticket.findById(id)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem fetching the ticket type. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    if (!ticketTypeExists) return res.status(400).json({ message: "bad-request", data: "Ticket type not found!" });

    await Ticket.findByIdAndDelete(id)
        .then(data => data)
        .catch(err => {
            console.log(`There's a problem deleting the ticket type. Error ${err}`);
            return res.status(400).json({ message: "bad-request", data: "There's a problem with the server! Please contact customer support for more details." });
        });

    return res.json({ message: "success" });
};

// #endregion
