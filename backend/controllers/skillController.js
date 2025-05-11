
const TeachingSkill = require('../models/TeachingSkill');
const LearningSkill = require('../models/LearningSkill');
const User = require('../models/User');

// @desc    Get all teaching skills for a user
// @route   GET /api/skills/teaching/:userId
// @access  Public
const getTeachingSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const skills = await TeachingSkill.find({ userId });
    
    res.status(200).json(skills);
  } catch (error) {
    console.error('Error fetching teaching skills:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all learning skills for a user
// @route   GET /api/skills/learning/:userId
// @access  Public
const getLearningSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const skills = await LearningSkill.find({ userId });
    
    res.status(200).json(skills);
  } catch (error) {
    console.error('Error fetching learning skills:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add teaching skill for a user
// @route   POST /api/skills/teaching
// @access  Private
const addTeachingSkill = async (req, res) => {
  try {
    const { skill, proficiencyLevel } = req.body;
    const userId = req.user.id;
    
    if (!skill) {
      return res.status(400).json({ error: 'Skill name is required' });
    }
    
    // Check if skill already exists for user
    const existingSkill = await TeachingSkill.findOne({ userId, skill });
    
    if (existingSkill) {
      return res.status(400).json({ error: 'You already have this teaching skill' });
    }
    
    // Create new skill
    const newSkill = await TeachingSkill.create({
      userId,
      skill,
      proficiencyLevel: proficiencyLevel || 'Intermediate'
    });
    
    res.status(201).json(newSkill);
  } catch (error) {
    console.error('Error adding teaching skill:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add learning skill for a user
// @route   POST /api/skills/learning
// @access  Private
const addLearningSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const userId = req.user.id;
    
    if (!skill) {
      return res.status(400).json({ error: 'Skill name is required' });
    }
    
    // Check if skill already exists for user
    const existingSkill = await LearningSkill.findOne({ userId, skill });
    
    if (existingSkill) {
      return res.status(400).json({ error: 'You already have this learning skill' });
    }
    
    // Create new skill
    const newSkill = await LearningSkill.create({
      userId,
      skill
    });
    
    res.status(201).json(newSkill);
  } catch (error) {
    console.error('Error adding learning skill:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete teaching skill
// @route   DELETE /api/skills/teaching/:skillId
// @access  Private
const deleteTeachingSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.user.id;
    
    const skill = await TeachingSkill.findById(skillId);
    
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    // Check if user owns this skill
    if (skill.userId.toString() !== userId) {
      return res.status(401).json({ error: 'Not authorized to delete this skill' });
    }
    
    await skill.remove();
    
    res.status(200).json({ success: true, message: 'Skill removed successfully' });
  } catch (error) {
    console.error('Error deleting teaching skill:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete learning skill
// @route   DELETE /api/skills/learning/:skillId
// @access  Private
const deleteLearningSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.user.id;
    
    const skill = await LearningSkill.findById(skillId);
    
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    // Check if user owns this skill
    if (skill.userId.toString() !== userId) {
      return res.status(401).json({ error: 'Not authorized to delete this skill' });
    }
    
    await skill.remove();
    
    res.status(200).json({ success: true, message: 'Skill removed successfully' });
  } catch (error) {
    console.error('Error deleting learning skill:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTeachingSkills,
  getLearningSkills,
  addTeachingSkill,
  addLearningSkill,
  deleteTeachingSkill,
  deleteLearningSkill
};
