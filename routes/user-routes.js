const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../config/authorization');

router.get('/verify/:phone', userController.verify_User_SIM)
    

router.post('/signup', auth.apiAccess, userController.signup_User)

router.post('/login', userController.login_user)

router.get('/confirm/:token', userController.confirm_User)

router.post('/confirm/resend/:email', userController.resend_Email_Confirmation)

router.delete('/delete/:email', userController.deleteUser)

router.use(auth.userAuth);
router.post('/verify/bvn/:id', userController.verify_User_BVN)
router.post('/changePassword/:id', userController.changePassword)

router.route('/profile/:id')
    .get(userController.get_Profile)
    .post(userController.update_Profile)

module.exports = router;