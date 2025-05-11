
const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllUsers);
router.get('/:userId', getUserById);
router.post('/', createUser);

// Protected routes
router.put('/:userId', protect, updateUser);
router.delete('/:userId', protect, deleteUser);

module.exports = router;
