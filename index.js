const app = require("./lib/app");

const router = require('./routes/index');

module.exports = app.create(router)
