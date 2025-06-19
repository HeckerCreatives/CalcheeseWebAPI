const router = require('express').Router();

const { createItem, getItems, deleteItem, editItem, deletemultipleitems } = require('../controllers/item');

const { protectsuperadmin } = require('../middleware/middleware');


router
    .post("/createitem", protectsuperadmin, createItem)
    .get("/getitems", protectsuperadmin, getItems)
    .post("/edititem", protectsuperadmin, editItem)
    .post("/deleteitem", protectsuperadmin, deleteItem)
    .post("/deletemultipleitems", protectsuperadmin, deletemultipleitems)

module.exports = router;