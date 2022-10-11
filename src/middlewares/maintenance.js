const maintenance = (req, res, next) => {
    res.status(503).send('We are closed for maintenance')
}
module.exports = maintenance