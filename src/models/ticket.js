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
    ticketType: {
        type: mongoose.Schema.Types.ObjectId
    },
    status: {
        type: String,
        required: true,
        default: 'New'
        /********
         * 
         * Statuses:
         * New
         * Assigned
         * In Progress
         * Awaiting Response
         * Customer Updated
         * Closed
         * 
         ********/
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    clientID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    companyID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
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

ticketSchema.statics.getTimeLogged = (ticket) => {
    var time = 0

    if(ticket.timelogs.length>0){
        ticket.timelogs.forEach(log => {
            if(log.endTime){
                time += ((new Date(log.endTime) - new Date(log.startTime))/1000)
            }
        })
    }

    return time
}

ticketSchema.statics.ticketQuery = async (user,query) => {
    try{
        const authLevel = user.auth.level
        if(authLevel===2){
            query.companyID=user.companyID
            query.clientID=user._id
            delete query.user
            delete query.ticketType
        }
        query.authLevel = authLevel
        const tickets = await Ticket.find(query)
        return tickets
    } catch(e) {
        return e
    }
}

ticketSchema.pre('save', async function (next) {
    const ticket = this
    if(ticket.isNew){
        ticket.ticketNumber = await Ticket.countDocuments()+1
    }

    if(ticket.status=='Closed'){
        ticket.closed = new Date()
    }

    next()
})

ticketSchema.pre('find', function(next) {
    try{
        const authLevel = this._conditions.authLevel
        if(authLevel!=0) {
            this._conditions.removed = false
        }
        delete this._conditions.authLevel
        next()
    } catch (e) {
        next(e)
    }
})

ticketSchema.post('find', function(error, doc, next) {
    console.log(error,doc)
    next()
})

ticketSchema.methods.toJSON = function () {
    const ticket = this.toObject()
    delete ticket.createdAt
    delete ticket.updatedAt
    delete ticket.__v
    delete ticket.removed
    delete ticket._id

    return ticket
}

const Ticket = mongoose.model('Ticket',ticketSchema)

module.exports = Ticket