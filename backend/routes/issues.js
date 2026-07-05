const { Router } = require('express');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/issueController');

const router = Router();

router.get('/', auth, ctrl.list);
router.get('/feed', auth, ctrl.feed);
router.post('/similar', auth, ctrl.findSimilar);
router.get('/:id', auth, ctrl.getById);
router.post('/', auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.post('/:id/delete-token', auth, ctrl.generateDeleteToken);
router.delete('/:id', auth, ctrl.deleteIssue);
router.post('/:id/resolve', auth, ctrl.resolve);
router.post('/:id/confirm', auth, ctrl.confirmResolution);
router.post('/:id/reject', auth, ctrl.rejectResolution);

module.exports = router;
