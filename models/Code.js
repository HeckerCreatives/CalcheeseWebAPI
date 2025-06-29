const mongoose = require('mongoose');

const CodeSchema = new mongoose.Schema(
    {
        expiration: {
            type: Date,
            index: true // Automatically creates an index on 'amount'
        },
        items: [{      
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            index: true // Automatically creates an index on 'amount'
        }],
        robuxcode: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RobuxCode',
            index: true // Automatically creates an index
        },
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            index: true // Automatically creates an index
        },
        type: {
            type: String,
            enum: ['robux', 'ticket', 'ingame', 'exclusive', 'chest'],
            index: true // Automatically creates an index on 'amount'
        },
        status: {
            type: String,
            enum: ['to-claim', 'claimed', 'pre-claimed', 'approved', 'rejected', 'to-generate'],
            default: 'to-claim',
            index: true // Automatically creates an index on 'amount'
        },
        isUsed: {
            type: Boolean,
            default: false,
            index: true // Automatically creates an index on 'amount'
        },
        code: {
            type: String,
            unique: true,
            index: true // Automatically creates an index on 'amount'
        },
        guardian: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        name: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        email: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        address: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        contact: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        picture: {
            type: String,
            index: true // Automatically creates an index on 'amount'
        },
        index: {
            type: Number,
            index: true // Automatically creates an index on 'amount'
        },
        length: {
            type: Number,
            index: true // Automatically creates an index on 'amount'
        },
        rarity: {
            type: String,
            enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
            index: true // Automatically creates an index on 'amount'
        },
        archived: {
            type: Boolean,
            default: false,
            index: true // Automatically creates an index on 'amount'
        },
    },
    {
        timestamps: true
    }
)

// Pre-save hook to check for duplicate code
CodeSchema.pre('save', async function(next) {
    if (!this.isModified('code')) return next();
    const existing = await mongoose.models.Code.findOne({ code: this.code });
    if (existing) {
        const err = new Error('Duplicate code detected');
        err.name = 'DuplicateCodeError';
        return next(err);
    }
    next();
});

CodeSchema.index({ type: 1, isUsed: 1 });

const Code = mongoose.model("Code", CodeSchema)

module.exports = Code ;