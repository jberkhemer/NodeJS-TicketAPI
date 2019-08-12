const express = require('express')
const Company = require('../models/company')
const auth = require('../middleware/auth')
const companyRouter = new express.Router()

companyRouter.get('/ticket/co/:company', auth, async (req,res) => {
    try {
        const company = await Company.findById(req.params.company)
        await company.populate({ path: 'tickets' }).execPopulate()
        res.send(company.tickets)
    } catch (e) {
        res.status(500).send({error: e})
    }
})
companyRouter.get('/users/co/:company', auth, async (req,res) => {
    try {
        const company = await Company.findById(req.params.company)
        await company.populate({ path: 'employees' }).execPopulate()
        res.send(company.employees)
    } catch (e) {
        res.status(500).send({error: e})
    }
})

module.exports = companyRouter