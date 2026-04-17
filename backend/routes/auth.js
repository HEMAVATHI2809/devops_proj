const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validation');
const { signup, login, getMe } = require('../controllers/authController');

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.get('/me', auth, getMe);

module.exports = router;
