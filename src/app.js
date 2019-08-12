const express = require('express')
const userRouter = require('./routers/user')
const ticketRouter = require('./routers/ticket')
const companyRouter = require('./routers/company')
require('./db/mongoose')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(ticketRouter)
app.use(companyRouter)

module.exports = app