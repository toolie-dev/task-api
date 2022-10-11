const express = require('express')
const router = new express.Router()
const User = require('../models/User')
const auth = require('../middlewares/auth')
const sharp = require('sharp')
const { sendWelcomeMessage, sendCancelMessage } = require('../email/email.js')
const multer = require('multer')
const Task = require('../models/Task')
const upload = multer({
    limits: {
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)/)) {
            cb(new Error('The file is not an image'), false)
        }
        cb(undefined, true)
    }
})

router.get('/', async (req, res) => {
    const users = await User.find({})
    res.send(users)
})

router.get('/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.patch('/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const areUpdatesAllowed = updates.every(update => {
        return allowedUpdates.includes(update)
    })
    if (areUpdatesAllowed == false) {
        res.status(400).send()
        return
    }
    try {
        const user = await User.findById(req.user._id)
        updates.forEach(update => user[update] = req.body[update])
        user.save()
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if (!user) {
        //     return res.status(404).send()
        // }
        req.user.remove()
        await Task.deleteMany({ createdBy: req.user._id })
        sendCancelMessage(req.user.email)
        res.send(req.user)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.post('/', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        sendWelcomeMessage(user.email)
        res.status(201).send(token)
    } catch(e) {
        res.status(400).send(e.toString())
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch(e) {
        res.status(400).send(e.toString())
    }
})

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = await sharp(req.file.buffer).png().resize(250, 250).toBuffer()
    await req.user.save()
    res.status(201).send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/:id/avatar', async (req, res) => {
    const id = req.params.id
    const user = await User.findById(id)
    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
})

router.delete('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

module.exports = router