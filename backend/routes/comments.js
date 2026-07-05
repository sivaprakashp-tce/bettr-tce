const { Router } = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/commentController');

const router = Router();

router.get('/:id/comments', auth, ctrl.list);
router.post('/:id/comments', auth, ctrl.create);

module.exports = router;
