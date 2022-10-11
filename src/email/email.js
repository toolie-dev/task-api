const apikey = ''
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeMessage = recipient => {
    const msg = {
        to: recipient,
        from: 'tolyanichworld@gmail.com',
        subject: 'Welcome to the task app',
        text: `Hi, ${recipient} and welcome to the task app`
    }
    sgMail.send(msg)
}

const sendCancelMessage = recipient => {
    const msg = {
        to: recipient,
        from: 'tolyanichworld@gmail.com',
        subject: 'Welcome to the task app',
        text: `Hi, ${recipient} we are very sorry, that you decided to leave us. Tell us what made you to do so`
    }
    sgMail.send(msg)
}

module.exports = {
    sendWelcomeMessage,
    sendCancelMessage
}