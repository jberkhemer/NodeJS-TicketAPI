const mongoose = require('mongoose')

const typeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
})

const TicketType = mongoose.model('TicketType', typeSchema)

module.exports = TicketType