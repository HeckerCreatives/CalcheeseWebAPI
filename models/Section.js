const { default: mongoose } = require("mongoose")

// minigames and welcome section
const ImagesSectionSchema = new mongoose.Schema(
    {
        section: {
            type: String,
            required: true,
            index: true // Automatically creates an index on 'section'
        },
        image: {
            type: String,
            required: true,
            index: true // Automatically creates an index on 'image'
        }
    },
    {
        timestamps: true
    }
)

// whats new section

const WhatsNewSectionSchema = new mongoose.Schema(
    {
        tab: {
            type: String,
            required: true,
            index: true // Automatically creates an index on 'tab'
        },
        description: {
            type: String,
            required: true,
            index: true // Automatically creates an index on 'description'
        },
        image: {
            type: String,
            required: true,
            index: true // Automatically creates an index on 'image'
        },
    },
    {
        timestamps: true
    }
)

// promo code section

const PromoCodeSectionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            index: true // Automatically creates an index on 'title'
        },
        description: {
            type: String,
            required: true,
            index: true // Automatically creates an index on 'description'
        },
    },
    {
        timestamps: true
    }
)


const ImageSection = mongoose.model('ImageSection', ImagesSectionSchema)
const WhatsNewSection = mongoose.model('WhatsNewSection', WhatsNewSectionSchema)
const PromoCodeSection = mongoose.model('PromoCodeSection', PromoCodeSectionSchema)

module.exports = { ImageSection, WhatsNewSection, PromoCodeSection }