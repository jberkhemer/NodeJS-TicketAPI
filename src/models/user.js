const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    fName: {
        type: String,
        required: true,
        trim: true
    },
    lName: {
        type: String,
        required: true,
        trim: true
    },
    userName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error('Please enter a valid email!')
            }
        }
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        minlength: 8,
        trim: true,
        validate(val){
            var hasUpperCase = /[A-Z]/.test(val)
            var hasLowerCase = /[a-z]/.test(val)
            var hasNumbers = /\d/.test(val)
            var hasNonalphas = /\W/.test(val)
            if (hasUpperCase + hasLowerCase + hasNumbers + hasNonalphas < 3 || val.toLowerCase().includes('password')){
                throw new Error('Password does not meet complexity requirements.')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    },
    ticketTimer: {
        type: Number,
    },
    auth: {
        title: {
            type: String,
            required: true,
            default: 'Agent'
        },
        level: {
            type: Number,
            required: true,
            default: 1
        }
    },
    companyID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    }
}, {
    timestamps: true
})

userSchema.virtual('assignedTickets', {
    ref: 'Ticket',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.virtual('clientTickets', {
    ref: 'Ticket',
    localField: '_id',
    foreignField: 'clientID'
})

userSchema.statics.findByCredentials = async (userName,password) => {
    const user = await User.findOne({ userName })

    if(!user){
        throw new Error('User not found')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user
}

userSchema.pre('save', async function (next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }

    next()
})

// userSchema.pre('remove', async function (next){
//     const user = this
//     await Task.deleteMany({owner: user._id})
//     next()
// })

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.methods.toJSON = function () {
    const user = this.toObject()
    delete user.age
    delete user.password
    delete user.tokens
    delete user.avatar
    delete user.authLevel

    return user
}

const User = mongoose.model('User',userSchema)

module.exports = User