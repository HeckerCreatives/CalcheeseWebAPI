const { default: mongoose } = require("mongoose");



const SocialLinkSchema = new mongoose.Schema(
    {
        link: {
            type: String,
            required: true,
            index: true // Automatically creates an index on 'link'
        },
        title: {
            type: String,
            required: true,
            index: true // Automatically creates an index on 'title'
        }
    },
    {
        timestamps: true
    }
)

const SocialLink = mongoose.model("SocialLink", SocialLinkSchema)

module.exports = SocialLink