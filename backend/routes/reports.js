const { Router } = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/reportController');

const router = Router();

router.post('/', auth, ctrl.create);

module.exports = router;
