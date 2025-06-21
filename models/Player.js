const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema(
    {
        playerid: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        token: {
            type: String,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'banned'],
            default: 'active'
        },
    },
    {
        timestamps: true
    }
)

const Player = mongoose.model('Player', PlayerSchema);
module.exports = Player;