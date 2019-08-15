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

typeSchema.methods.toJSON = function () {
    const TicketType = this.toObject()
    delete TicketType.createdAt
    delete TicketType.updatedAt
    delete TicketType.__v

    return TicketType
}

const TicketType = mongoose.model('TicketType', typeSchema)

module.exports = TicketType