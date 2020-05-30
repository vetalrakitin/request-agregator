const express = require("express");
const router = express.Router();

const customersService = require('../services/customers');
const genericController = require('../controllers/generic');

router.get('/:id', genericController.getById(customersService, 'id'));

module.exports = router;
