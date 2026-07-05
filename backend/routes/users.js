const { Router } = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/userController');

const router = Router();

router.get('/me', auth, ctrl.getProfile);
router.put('/me', auth, ctrl.updateProfile);
router.get('/me/stats', auth, ctrl.getStats);
router.get('/me/issues', auth, ctrl.myIssues);
router.get('/me/activity', auth, ctrl.myActivity);

module.exports = router;
