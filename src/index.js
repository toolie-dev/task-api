const express = require('express')
require('./db/mongoose')
const maintenance = require('./middlewares/maintenance')
const Task = require('./models/Task')


const userRouter = require('./routers/user.js')
const taskRouter = require('./routers/task.js')

const app = express()
app.use(express.json())
app.use('/users', userRouter)
app.use('/tasks', taskRouter)



const port = process.env.PORT || 3000

app.listen(port, () => console.log('Server is running'))
