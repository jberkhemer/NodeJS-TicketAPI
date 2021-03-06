const mongoose = require('mongoose')
const Ticket = require('./ticket')

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
})

companySchema.virtual('tickets', {
    ref: 'Ticket',
    localField: '_id',
    foreignField: 'companyID'
})

companySchema.virtual('employees', {
    ref: 'User',
    localField: '_id',
    foreignField: 'companyID'
})

companySchema.methods.toJSON = function () {
    const company = this.toObject()
    delete company.createdAt
    delete company.updatedAt
    delete company.__v

    return company
}

const Company = mongoose.model('Company', companySchema)

module.exports = Company