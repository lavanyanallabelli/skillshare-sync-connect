
const { supabase } = require('../config/supabaseClient');

// Get teaching skills for a user
const getTeachingSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('teaching_skills')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching teaching skills:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get learning skills for a user
const getLearningSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('learning_skills')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching learning skills:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add a teaching skill for the current user
const addTeachingSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill, proficiencyLevel } = req.body;
    
    if (!skill || !proficiencyLevel) {
      return res.status(400).json({ error: 'Skill and proficiency level are required' });
    }
    
    // First check if the skill already exists for this user
    const { data: existingSkill, error: checkError } = await supabase
      .from('teaching_skills')
      .select('*')
      .eq('user_id', userId)
      .eq('skill', skill)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is the code for "no rows returned", which is what we want
      throw checkError;
    }
    
    if (existingSkill) {
      return res.status(400).json({ error: 'You already have this teaching skill' });
    }
    
    const newSkill = {
      user_id: userId,
      skill,
      proficiency_level: proficiencyLevel
    };
    
    const { data, error } = await supabase
      .from('teaching_skills')
      .insert([newSkill])
      .select();
      
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error adding teaching skill:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add a learning skill for the current user
const addLearningSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill } = req.body;
    
    if (!skill) {
      return res.status(400).json({ error: 'Skill is required' });
    }
    
    // First check if the skill already exists for this user
    const { data: existingSkill, error: checkError } = await supabase
      .from('learning_skills')
      .select('*')
      .eq('user_id', userId)
      .eq('skill', skill)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is the code for "no rows returned", which is what we want
      throw checkError;
    }
    
    if (existingSkill) {
      return res.status(400).json({ error: 'You already have this learning skill' });
    }
    
    const newSkill = {
      user_id: userId,
      skill
    };
    
    const { data, error } = await supabase
      .from('learning_skills')
      .insert([newSkill])
      .select();
      
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error adding learning skill:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a teaching skill for the current user
const deleteTeachingSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillId } = req.params;
    
    // Verify the skill belongs to the user
    const { data: skillData, error: fetchError } = await supabase
      .from('teaching_skills')
      .select('user_id')
      .eq('id', skillId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (!skillData) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    if (skillData.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this skill' });
    }
    
    const { error } = await supabase
      .from('teaching_skills')
      .delete()
      .eq('id', skillId);
      
    if (error) throw error;
    
    res.status(200).json({ message: 'Teaching skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting teaching skill:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a learning skill for the current user
const deleteLearningSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillId } = req.params;
    
    // Verify the skill belongs to the user
    const { data: skillData, error: fetchError } = await supabase
      .from('learning_skills')
      .select('user_id')
      .eq('id', skillId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (!skillData) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    if (skillData.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this skill' });
    }
    
    const { error } = await supabase
      .from('learning_skills')
      .delete()
      .eq('id', skillId);
      
    if (error) throw error;
    
    res.status(200).json({ message: 'Learning skill deleted successfully' });
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
