const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.route('/verify/:phone')
    .get(userController.verify_User_SIM)

router.route('/signup')
    .post(userController.signup_User)

router.route('/confirm/:token')
    .get(userController.confirm_User)

module.exports = router;