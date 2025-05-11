
const express = require('express');
const router = express.Router();
const {
  getAllSessions,
  getSessionById,
  createSessionRequest,
  respondToSessionRequest
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', getAllSessions);
router.get('/:sessionId', getSessionById);
router.post('/', createSessionRequest);
router.put('/:sessionId/respond', respondToSessionRequest);

module.exports = router;
