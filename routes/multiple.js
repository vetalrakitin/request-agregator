const express = require("express");
const router = express.Router();
const httpService = require('../services/http');
const axios = require('axios');
const multipleController = require('../controllers/multiple');

// TODO: expose to environment
const TIMEOUT = 1000;
const backendUrl = 'http://localhost:3000';

router.get("/", multipleController.get(httpService.create(axios, backendUrl), { timeout: TIMEOUT }));

module.exports = router;
