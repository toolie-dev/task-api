const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true
}, (err) => {
    if (!err) {
        console.log('DB is running')
    } else {
        console.log('DB has failed to launch')
        console.log(err)
    }
})


