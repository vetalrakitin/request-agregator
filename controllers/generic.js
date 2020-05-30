function getById(service, paramName) {
    return (req, res) => {
        try {
            res.json(service.getById(req.params[paramName]));
        } catch(e) {
            res.status(404).end();
        }
    }
}

module.exports = {
    getById
}