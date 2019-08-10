const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema({
    ticketNumber: {
        type: Number,
        default: 1,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    timelogs: [{
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }],
    notes: [{
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        note: {
            type: String,
            required: true
        },
        dateAdded: {
            type: Date,
            required: true
        }
    }],
    opened: {
        type: Date,
        required: true
    },
    closed: {
        type: Date
    },
    removed: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

ticketSchema.statics.findTickets = async (user, showCompleted=false, showRemoved=false) => {
    if(user.auth.level===0){
        if(showCompleted===true&&showRemoved===true){
            const tickets = await Ticket.find()
            return tickets
        } else if(showCompleted===true){
            const tickets = await Ticket.find({ removed: false })
            return tickets
        } else if(showRemoved===true){
            const tickets = await Ticket.find({ completed: false })
            return tickets
        } else {
            const tickets = await Ticket.find({ completed: false, removed: false })
            return tickets
        }
    } else if(user.auth.level===1) {
        if(showCompleted==true){
            const tickets = await Ticket.find({ removed: false })
            return tickets
        } else{
            const tickets = await Ticket.find({ completed: false, removed: false })
            return tickets
        }
    } else {
        if(showCompleted==true){
            const tickets = await Ticket.find({ removed: false, client: user._id })
            return tickets
        } else {
            const tickets = await Ticket.find({ completed: false, removed: false, client: user._id })
            return tickets
        }
    }
}

ticketSchema.pre('save', async function (next){
    const ticket = this
    if(ticket.isNew){
        ticket.ticketNumber = await Ticket.countDocuments()+1
    }

    if(ticket.completed==true){
        ticket.closed = new Date()
    }

    next()
})

const Ticket = mongoose.model('Ticket',ticketSchema)

module.exports = Ticket