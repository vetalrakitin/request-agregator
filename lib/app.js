const express = require('express');
// const logger = require('morgan');

function create(route) {
    const app = express();

    // app.use(logger('dev'));
    app.use(express.urlencoded({ extended: false }));

    app.use(route);
    
    return app;
}

module.exports = {
    create
};
