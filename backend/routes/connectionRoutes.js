
const express = require('express');
const router = express.Router();
const {
  getConnections,
  getPendingRequests,
  sendConnectionRequest,
  respondToRequest,
  removeConnection
} = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', getConnections);
router.get('/pending', getPendingRequests);
router.post('/', sendConnectionRequest);
router.put('/:connectionId/respond', respondToRequest);
router.delete('/:connectionId', removeConnection);

module.exports = router;
