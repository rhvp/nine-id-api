const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.route('/verify/:phone')
    .get(userController.verify_User)

router.route('/signup')
    .post(userController.signup_User)


module.exports = router;