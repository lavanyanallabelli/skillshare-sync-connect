
const User = require('../models/User');
const TeachingSkill = require('../models/TeachingSkill');
const LearningSkill = require('../models/LearningSkill');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:userId
// @access  Public
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get teaching skills
    const teachingSkills = await TeachingSkill.find({ userId: user._id });
    
    // Get learning skills
    const learningSkills = await LearningSkill.find({ userId: user._id });
    
    // Combine user data with skills
    const userProfile = {
      ...user.toObject(),
      teachingSkills,
      learningSkills
    };

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Public
const createUser = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    const user = await User.create(req.body);
    
    // Create token
    const token = user.getSignedJwtToken();
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:userId
// @access  Private
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    let user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Ensure user can only update their own profile
    if (userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized to update this user' });
    }
    
    user = await User.findByIdAndUpdate(
      userId,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:userId
// @access  Private
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Ensure user can only delete their own account
    if (userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized to delete this user' });
    }
    
    await user.remove();
    
    res.status(200).json({ success: true, message: 'User deleted successfully' });
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
