const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');
const auth = require('../config/authorization');

router.get('/merchants', merchantController.get_Merchants)

router.get('/merchant/:id', merchantController.get_Single_Merchant)

module.exports = router;