const express = require('express')
const Ticket = require('../models/ticket')
const auth = require('../middleware/auth')
const ticketRouter = new express.Router()

ticketRouter.get('/ticket', auth, async (req,res) => {
    try {
        const tickets = await Ticket.findTickets(req.user,req.body.completed,req.body.removed)

        if(!tickets){
            res.send({ message: 'Great job! There\'s no tickets!' })
        }
        res.send(tickets)
    } catch (e) {
        res.status(500).send({error: e})
    }
})
ticketRouter.get('/ticket/:id', auth, async (req,res) => { // Get single ticket
    try {
        const ticket = await Ticket.findOne({ ticketNumber: req.params.id })

        if(!ticket){
            return res.status(404).send({ error: 'User not found' })
        }
        res.send(ticket)
    } catch (e) {
        res.status(500).send({error: e})
    }
})
ticketRouter.get('/mytickets', auth, async (req,res) => { // Get all tickets assigned to currently logged in user
    // const match = {}
    const sort = {}

    // if(req.query.completed){
    //     match.completed = req.query.completed === 'true'
    // }
    
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'assignedTickets',
            options: {
                limit: parseInt(req.query.limit) || 10,
                skip: (parseInt(req.query.page)-1)*parseInt(req.query.limit) || (parseInt(req.query.page)-1)*10,
                sort
            }
        }).execPopulate()
        res.send(req.user.assignedTickets)
    } catch (e) {
        res.status(500).send({error: e})
    }
})
ticketRouter.post('/ticket', auth, async (req,res) => { // Create ticket
    try{
        const ticket = new Ticket({
            ...req.body,
            owner: req.body.userID,
            opened: new Date()
        })
        await ticket.save()
        res.status(201).send(ticket)
    } catch (e) {
        res.status(400).send({error: e})
    }
})
ticketRouter.patch('/ticket/:id/assign', auth, async (req,res) => {
    try {
        const ticket = await Ticket.findOne({ ticketNumber: req.params.id })

        if(!ticket){
            return res.status(404).send ({ error: 'Ticket not found' })
        }
        
        ticket.owner = req.body.userID
        await ticket.save()
        res.send(ticket)
    } catch (e) {
        res.status(500).send({ error: e })
    }
})
ticketRouter.post('/ticket/:id/note', auth, async (req,res) => {
    try {
        const ticket = await Ticket.findOne({ ticketNumber: req.params.id })

        if(!ticket){
            return res.status(404).send({ error: 'User not found' })
        }
        ticket.notes = ticket.notes.concat({
            owner: req.user._id,
            note: req.body.note,
            dateAdded: new Date()
        })
        await ticket.save()
        res.send(ticket)
    } catch (e) {
        res.status(500).send({error: e})
    }
})
ticketRouter.post('/ticket/:id/close', auth, async (req,res) => {
    try {
        const ticket = await Ticket.findOne({ ticketNumber: req.params.id })

        if(!ticket){
            return res.status(404).send({ error: 'User not found' })
        }
        ticket.completed = true
        await ticket.save()
        res.send(ticket)
    } catch (e) {
        res.status(500).send({error: e})
    }
})
ticketRouter.post('/ticket/:id/time', auth, async (req,res) => {
    try {
        const ticket = await Ticket.findOne({ ticketNumber: req.params.id })
        const ticketNumber = parseInt(req.params.id)
        if(!ticket){
            return res.status(404).send({ error: 'User not found' })
        }

        if(req.user.ticketTimer===ticketNumber){
            ticket.timelogs.find((o, i) => {
                if (o.owner.toString() == req.user._id.toString() && !o.endTime) {
                    ticket.timelogs[i].endTime = new Date()
                    return true
                }
            })
            await ticket.save()
            req.user.ticketTimer = undefined
            await req.user.save()
            res.send(ticket)
        } else if(!req.user.ticketTimer) {
            ticket.timelogs = ticket.timelogs.concat({
                startTime: new Date(),
                owner: req.user._id
            })
            await ticket.save()
            req.user.ticketTimer = req.params.id
            await req.user.save()
            res.send(ticket)
        } else {
            res.status(409).send(new Error('Timer is running on another ticket.'))
        }
    } catch (e) {
        res.status(500).send({error: e})
    }
})
ticketRouter.post('/ticket/:id/time/:out', auth, async (req,res) => {
    try {
        const ticket = await Ticket.findOne({ ticketNumber: req.params.id })

        if(!ticket){
            return res.status(404).send({ error: 'Ticket not found!' })
        }

        ticket.timelogs.find((o, i) => {
            if (o.owner.toString() == req.user._id.toString() && !o.endTime) {
                ticket.timelogs[i].endTime = req.params.out
                return true
            }
        })

        if(req.user.ticketTimer===ticketNumber){
            req.user.ticketTimer = req.params.id
            await req.user.save()
        }

        await ticket.save()
        res.send(ticket)
    } catch (e) {
        res.status(500).send({error: e})
    }
})
ticketRouter.post('/ticket/:id/time/:out/:in', auth, async (req,res) => {
    try {
        const ticket = await Ticket.findOne({ ticketNumber: req.params.id })

        if(!ticket){
            return res.status(404).send({ error: 'User not found' })
        }

        ticket.timelogs = ticket.timelogs.concat({
            startTime: req.params.in,
            endTime: req.params.out,
            owner: req.user._id
        })
        await ticket.save()
        res.send(ticket)
    } catch (e) {
        res.status(500).send({error: e})
    }
})
ticketRouter.patch('/ticket/:id', auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates =['title', 'description', 'completed', 'owner', 'client']
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidUpdate){
        return res.status(400).send({ error: 'Invalid key provided'})
    }

    try{
        const ticket = await Ticket.find({ ticketNumber: req.params.id })

        if(!task){
            return res.status(404).send({ error: 'Task not found' })
        }

        updates.forEach((update) => ticket[update] = req.body[update])
        await ticket.save()
        res.send(task)
    } catch (e) {
        res.status(500).send({ error: e })
    }
})
ticketRouter.delete('/ticket/:id', auth, async (req,res) => {
    try{
        const ticket = await Ticket.findOne({ ticketNumber: req.params.id })

        if(!ticket){
            return res.status(404).send({ error: 'Ticket not found' })
        }
        ticket.removed = !ticket.removed
        await ticket.save()
        res.send(ticket)
    } catch (e) {
        res.status(500).send({error: e})
    }
})

module.exports = ticketRouter