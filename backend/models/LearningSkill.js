
const mongoose = require('mongoose');

const learningSkillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LearningSkill', learningSkillSchema);
