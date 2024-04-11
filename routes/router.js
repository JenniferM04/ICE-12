const router = require('express').Router();
const passport = require('passport');
const isAuth = require('./authMiddleware').isAuth;

const {
	homeView,
    getLogin,
    getLogout,
    getRegister,
	postRegister,
    postLogin
} = require('../controllers/user.controller');

// Home/Index 
router.get('/', homeView);

// Login
router.get('/login', getLogin);
router.post('/login', postLogin);

// Logout
router.get('/logout', getLogout);

// Register
router.get('/register', getRegister);
router.post('/register', postRegister);

module.exports = router;
