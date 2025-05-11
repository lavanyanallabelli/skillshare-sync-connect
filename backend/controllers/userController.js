
const { supabase } = require('../config/supabaseClient');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, bio, location, occupation, education, avatar_url, headline')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single user by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new user (typically handled by auth system but included for API completeness)
const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, bio, location, occupation, education } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, firstName, and lastName are required' });
    }
    
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });
    
    if (authError) throw authError;
    
    // The profile should be created automatically via trigger, but we can update additional fields
    const { data, error } = await supabase
      .from('profiles')
      .update({
        bio: bio || null,
        location: location || null,
        occupation: occupation || null,
        education: education || null
      })
      .eq('id', authData.user.id)
      .select();
      
    if (error) throw error;
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName,
        lastName,
        bio: bio || null,
        location: location || null,
        occupation: occupation || null,
        education: education || null
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a user profile
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, bio, location, occupation, education, website, linkedin, github, twitter, headline, avatarUrl } = req.body;
    
    // Ensure the authenticated user is updating their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this user' });
    }
    
    const updates = {
      updated_at: new Date().toISOString()
    };
    
    // Only include fields that are provided
    if (firstName !== undefined) updates.first_name = firstName;
    if (lastName !== undefined) updates.last_name = lastName;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (occupation !== undefined) updates.occupation = occupation;
    if (education !== undefined) updates.education = education;
    if (website !== undefined) updates.website = website;
    if (linkedin !== undefined) updates.linkedin = linkedin;
    if (github !== undefined) updates.github = github;
    if (twitter !== undefined) updates.twitter = twitter;
    if (headline !== undefined) updates.headline = headline;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();
      
    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure the authenticated user is deleting their own account
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this user' });
    }
    
    // Delete the user from Supabase Auth
    // This will cascade delete the profile and related data due to RLS policies
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) throw error;
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
