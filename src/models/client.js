const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 7,
        trim: true,
        validate(val){
            if(val.toLowerCase().includes('password')){
                throw new Error('Password cannot contain \'Password\'')
            }
        }
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
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    },
    company: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
})

clientSchema.virtual('tickets', {
    ref: 'Ticket',
    localField: '_id',
    foreignField: 'client'
})

clientSchema.statics.findByCredentials = async (email,password) => {
    const client = await Client.findOne({ email })
    if(!client){
        throw 'User not found'
    }

    const isMatch = await bcrypt.compare(password, client.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }
    return client
}

clientSchema.pre('save', async function (next){
    const client = this

    if(client.isModified('password')){
        client.password = await bcrypt.hash(client.password,8)
    }

    next()
})

clientSchema.methods.generateAuthToken = async function () {
    const client = this
    const token = jwt.sign({ _id: client._id.toString() }, process.env.JWT_SECRET)

    client.tokens = client.tokens.concat({ token })
    await client.save()

    return token
}

clientSchema.methods.toJSON = function () {
    const client = this.toObject()
    delete client.password
    delete client.tokens
    delete client.avatar
    return client
}

const Client = mongoose.model('Client',userSchema)

module.exports = Client