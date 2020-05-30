const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

function create(route) {
    const app = express();

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    app.use(route);
    
    return app;
}

module.exports = {
    create
};
