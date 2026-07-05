const { Router } = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/voteController');

const router = Router();

router.post('/:id/upvote', auth, ctrl.toggleUpvote);
router.get('/:id/vote', auth, ctrl.status);

module.exports = router;
