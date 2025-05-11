
const Session = require('../models/Session');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Get all sessions
// @route   GET /api/sessions
// @access  Private
const getAllSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find sessions where the user is either teacher or student
    const sessions = await Session.find({
      $or: [{ teacherId: userId }, { studentId: userId }]
    })
    .sort({ createdAt: -1 });
    
    // Populate user details
    const populatedSessions = await Promise.all(
      sessions.map(async (session) => {
        const teacher = await User.findById(session.teacherId).select('firstName lastName avatar');
        const student = await User.findById(session.studentId).select('firstName lastName avatar');
        
        return {
          ...session.toObject(),
          teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
          teacherAvatar: teacher?.avatar,
          studentAvatar: student?.avatar
        };
      })
    );
    
    res.status(200).json(populatedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get session by ID
// @route   GET /api/sessions/:sessionId
// @access  Private
const getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    
    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }
    
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if user is authorized to view this session
    if (session.teacherId.toString() !== userId && session.studentId.toString() !== userId) {
      return res.status(401).json({ error: 'Not authorized to view this session' });
    }
    
    // Get teacher and student details
    const teacher = await User.findById(session.teacherId).select('firstName lastName avatar');
    const student = await User.findById(session.studentId).select('firstName lastName avatar');
    
    const populatedSession = {
      ...session.toObject(),
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
      studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
      teacherAvatar: teacher?.avatar,
      studentAvatar: student?.avatar
    };
    
    res.status(200).json(populatedSession);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a session request
// @route   POST /api/sessions
// @access  Private
const createSessionRequest = async (req, res) => {
  try {
    const { teacherId, skill, day, timeSlot } = req.body;
    const studentId = req.user.id;
    
    if (!teacherId || !skill || !day || !timeSlot) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create session
    const session = await Session.create({
      teacherId,
      studentId,
      skill,
      day,
      timeSlot,
      status: 'pending'
    });
    
    // Create notification for teacher
    const student = await User.findById(studentId).select('firstName lastName');
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'A student';
    
    await Notification.create({
      userId: teacherId,
      type: 'session_create',
      title: 'New Session Request',
      description: `${studentName} has requested a session for ${skill} on ${new Date(day).toLocaleDateString()} at ${timeSlot}.`,
      actionUrl: '/profile?tab=requests',
      iconType: 'calendar'
    });
    
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session request:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Respond to a session request (accept/decline)
// @route   PUT /api/sessions/:sessionId/respond
// @access  Private
const respondToSessionRequest = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { accept, meetingLink } = req.body;
    const teacherId = req.user.id;
    
    if (typeof accept !== 'boolean') {
      return res.status(400).json({ error: 'Missing accept parameter' });
    }
    
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Ensure user is the teacher for this session
    if (session.teacherId.toString() !== teacherId) {
      return res.status(401).json({ error: 'Not authorized to respond to this session request' });
    }
    
    // Update session status
    session.status = accept ? 'accepted' : 'declined';
    
    if (accept && meetingLink) {
      session.meetingLink = meetingLink;
    }
    
    await session.save();
    
    // Create notification for student
    const teacher = await User.findById(teacherId).select('firstName lastName');
    const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Your teacher';
    
    await Notification.create({
      userId: session.studentId,
      type: `session_${accept ? 'accept' : 'decline'}`,
      title: `Session Request ${accept ? 'Accepted' : 'Declined'}`,
      description: `${teacherName} has ${accept ? 'accepted' : 'declined'} your session request for ${session.skill} on ${new Date(session.day).toLocaleDateString()} at ${session.timeSlot}.`,
      actionUrl: '/profile?tab=sessions',
      iconType: accept ? 'check-circle' : 'x-circle'
    });
    
    res.status(200).json(session);
  } catch (error) {
    console.error('Error responding to session request:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSessions,
  getSessionById,
  createSessionRequest,
  respondToSessionRequest
};
