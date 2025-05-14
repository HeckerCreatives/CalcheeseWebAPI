const router = require('express').Router();

const { createItem, getItems, deleteItem, editItem } = require('../controllers/item');

const { protectsuperadmin } = require('../middleware/middleware');


router
    .post("/createitem", protectsuperadmin, createItem)
    .get("/getitems", protectsuperadmin, getItems)
    .post("/updateitem", protectsuperadmin, editItem)
    .post("/deleteitem", protectsuperadmin, deleteItem)

module.exports = router;