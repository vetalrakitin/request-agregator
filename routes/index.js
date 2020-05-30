const express = require("express");
const router = express.Router();

const multipleRoute = require('./multiple');
const productsRoute = require('./products');
const customersRoute = require('./customers');

router.use('/products', productsRoute);
router.use('/customers', customersRoute);
router.use('/multiple', multipleRoute);

module.exports = router;
