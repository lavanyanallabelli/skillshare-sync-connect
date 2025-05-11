
const express = require('express');
const router = express.Router();
const { 
  getTeachingSkills,
  getLearningSkills,
  addTeachingSkill,
  addLearningSkill,
  deleteTeachingSkill,
  deleteLearningSkill
} = require('../controllers/skillController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/teaching/:userId', getTeachingSkills);
router.get('/learning/:userId', getLearningSkills);

// Protected routes
router.post('/teaching', protect, addTeachingSkill);
router.post('/learning', protect, addLearningSkill);
router.delete('/teaching/:skillId', protect, deleteTeachingSkill);
router.delete('/learning/:skillId', protect, deleteLearningSkill);

module.exports = router;
