const customerList = require('./customers.json');

// Here we could provide different source of the data
// In our case we're using json object but it could be an http request, a db request, etc
function getById(id) {
    const data = customerList[id];
    if (data) {
        return data
    } else {
        throw new Error(`Customer is not found by id: ${id}`);
    }
}

module.exports = {
    getById
}