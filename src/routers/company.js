const express = require('express')
const Company = require('../models/company')
const auth = require('../middleware/auth')
const companyRouter = new express.Router()

companyRouter.get('/company/:id', auth, async (req,res) => {
    try {
        const company = await Company.findById(req.params.id)

        if(req.query.tickets){
            await company.populate({ path: 'tickets' }).execPopulate()
            res.send(company.tickets)
        } else if (req.query.employees){
            await company.populate({ path: 'employees' }).execPopulate()
            res.send(company.employees)
        } else {
            await company.populate({ path: 'tickets' }).execPopulate()
            await company.populate({ path: 'employees' }).execPopulate()
            res.send({
                _id: company.id,
                name: company.name,
                tickets: company.tickets,
                employees: company.employees
            })
        }
    } catch (e) {
        res.status(500).send({error: e})
    }
})
companyRouter.get('/users/co/:company', auth, async (req,res) => {
    try {
        const company = await Company.findById(req.params.company)
        
    } catch (e) {
        res.status(500).send({error: e})
    }
})

module.exports = companyRouter