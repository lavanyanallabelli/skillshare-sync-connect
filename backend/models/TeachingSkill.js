
const mongoose = require('mongoose');

const teachingSkillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  proficiencyLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TeachingSkill', teachingSkillSchema);
