const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../config/authorization');

router.get('/verify/:phone', userController.verify_User_SIM)
    

router.post('/signup', auth, userController.signup_User)

router.post('/login', userController.login_user)

router.get('/confirm/:token', userController.confirm_User)

router.post('/confirm/resend/:id', userController.resend_Email_Confirmation)
    

module.exports = router;