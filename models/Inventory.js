const { default: mongoose } = require("mongoose");


const InventorySchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player',
        },
        type: {
            type: String,
            required: true,
            enum: ['robux', 'ticket', 'ingame', 'chest', 'exclusive'],
        },
        rarity: {
            type: String,
            required: true,
            enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        },
        item: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
        }],
        code: {
            type: String,
            required: true,
            unique: true,
        },
    }, 
    {
        timestamps: true
    }
);

const Inventory = mongoose.model('Inventory', InventorySchema);
module.exports = Inventory;