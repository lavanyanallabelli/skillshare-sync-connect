
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

// Add a teaching skill
const addTeachingSkill = async (req, res) => {
  try {
    const { skill, proficiencyLevel } = req.body;
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('teaching_skills')
      .insert([{
        user_id: userId,
        skill,
        proficiency_level: proficiencyLevel || 'Intermediate'
      }])
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error adding teaching skill:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add a learning skill
const addLearningSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('learning_skills')
      .insert([{
        user_id: userId,
        skill
      }])
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error adding learning skill:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a teaching skill
const deleteTeachingSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.user.id;
    
    // First verify the skill belongs to the user
    const { data: skillData } = await supabase
      .from('teaching_skills')
      .select('*')
      .eq('id', skillId)
      .eq('user_id', userId)
      .single();
    
    if (!skillData) {
      return res.status(404).json({ error: 'Skill not found or not owned by user' });
    }
    
    const { error } = await supabase
      .from('teaching_skills')
      .delete()
      .eq('id', skillId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting teaching skill:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a learning skill
const deleteLearningSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.user.id;
    
    // First verify the skill belongs to the user
    const { data: skillData } = await supabase
      .from('learning_skills')
      .select('*')
      .eq('id', skillId)
      .eq('user_id', userId)
      .single();
    
    if (!skillData) {
      return res.status(404).json({ error: 'Skill not found or not owned by user' });
    }
    
    const { error } = await supabase
      .from('learning_skills')
      .delete()
      .eq('id', skillId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    res.status(200).json({ message: 'Skill deleted successfully' });
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
