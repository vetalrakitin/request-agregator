const express = require("express");
const router = express.Router();

const productsService = require('../services/products');
const genericController = require('../controllers/generic');

router.get('/:id', genericController.getById(productsService, 'id'));

module.exports = router;
