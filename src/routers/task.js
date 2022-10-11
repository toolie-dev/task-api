const express = require('express')
const router = new express.Router()
const Task = require('../models/Task')
const auth = require('../middlewares/auth')

router.get('/', auth, async (req, res) => {
    const match = {}
    if (req.query.completed) {
        match.completed = (req.query.completed === 'true')
    }
    const sort = {}
    if (req.query.sortBy) {
        const params = req.query.sortBy.split(':',)
        sort[params[0]] = params[1] === 'desc' ? -1: 1
        console.log(sort)
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
    } catch(e) {
        res.status(500).send(e.toString())
    }
})

router.get('/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id })
        console.log(req.user)
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.patch('/:id', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['description', 'completed']
        const areUpdatesAllowed = updates.every(update => {
            return allowedUpdates.includes(update)
        })
        if (areUpdatesAllowed == false) {
            res.status(400).send()
            return
        }
        const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id})
        updates.forEach(update => task[update] = req.body[update])
        task.save()
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.post('/', auth, (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body, 
        createdBy: req.user._id
    })
    
    try {
        task.save()
        res.status(201).send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

module.exports = router