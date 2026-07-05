const { Router } = require('express');
const auth = require('../middleware/auth');
const validateEmail = require('../middleware/validateEmail');
const ctrl = require('../controllers/authController');

const router = Router();

router.post('/register', validateEmail, ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', auth, ctrl.getMe);

module.exports = router;
