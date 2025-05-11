
const { supabase } = require('../config/supabaseClient');

// Get all sessions for the current user (either as teacher or student)
const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*, teacher:teacher_id(id, first_name, last_name, avatar_url), student:student_id(id, first_name, last_name, avatar_url)')
      .or(`teacher_id.eq.${userId},student_id.eq.${userId}`)
      .order('day', { ascending: true });
      
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single session by ID
const getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*, teacher:teacher_id(id, first_name, last_name, avatar_url), student:student_id(id, first_name, last_name, avatar_url)')
      .eq('id', sessionId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Session not found' });
      }
      throw error;
    }
    
    // Check if user is part of this session
    if (data.teacher_id !== userId && data.student_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this session' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new session request
const createSession = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { teacherId, skill, day, timeSlot } = req.body;
    
    if (!teacherId || !skill || !day || !timeSlot) {
      return res.status(400).json({ error: 'Teacher ID, skill, day, and time slot are required' });
    }
    
    // Check if the requested day and time slot are available for the teacher
    const { data: availabilityData, error: availabilityError } = await supabase
      .from('user_availability')
      .select('*')
      .eq('user_id', teacherId)
      .eq('day', day)
      .eq('time_slot', timeSlot)
      .eq('is_available', true)
      .single();
      
    if (availabilityError && availabilityError.code !== 'PGRST116') {
      throw availabilityError;
    }
    
    if (!availabilityData) {
      return res.status(400).json({ error: 'The teacher is not available at the requested time' });
    }
    
    // Check if teacher has the requested skill
    const { data: skillData, error: skillError } = await supabase
      .from('teaching_skills')
      .select('*')
      .eq('user_id', teacherId)
      .eq('skill', skill)
      .single();
      
    if (skillError && skillError.code !== 'PGRST116') {
      throw skillError;
    }
    
    if (!skillData) {
      return res.status(400).json({ error: 'The teacher does not teach this skill' });
    }
    
    // Create the session
    const newSession = {
      teacher_id: teacherId,
      student_id: studentId,
      skill,
      day,
      time_slot: timeSlot,
      status: 'pending'
    };
    
    const { data, error } = await supabase
      .from('sessions')
      .insert([newSession])
      .select();
      
    if (error) throw error;
    
    // Create notification for the teacher
    const notification = {
      user_id: teacherId,
      title: 'New Session Request',
      description: `You have a new session request for ${skill} on ${day} at ${timeSlot}`,
      type: 'session_request',
      action_url: `/profile?tab=requests`
    };
    
    await supabase
      .from('notifications')
      .insert([notification]);
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a session (accept/decline/cancel)
const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, meetingLink } = req.body;
    const userId = req.user.id;
    
    if (!['pending', 'accepted', 'declined', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    // Check if the session exists and the user is part of it
    const { data: sessionData, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
      
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Session not found' });
      }
      throw fetchError;
    }
    
    // Check if user is part of this session
    if (sessionData.teacher_id !== userId && sessionData.student_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this session' });
    }
    
    // Apply different rules based on the requested status change
    if (status === 'accepted') {
      // Only teachers can accept sessions
      if (sessionData.teacher_id !== userId) {
        return res.status(403).json({ error: 'Only teachers can accept sessions' });
      }
      
      // Session must be in 'pending' status to be accepted
      if (sessionData.status !== 'pending') {
        return res.status(400).json({ error: 'Cannot accept a session that is not pending' });
      }
      
      // Meeting link is required when accepting
      if (!meetingLink) {
        return res.status(400).json({ error: 'Meeting link is required when accepting a session' });
      }
    } else if (status === 'declined') {
      // Only teachers can decline sessions
      if (sessionData.teacher_id !== userId) {
        return res.status(403).json({ error: 'Only teachers can decline sessions' });
      }
      
      // Session must be in 'pending' status to be declined
      if (sessionData.status !== 'pending') {
        return res.status(400).json({ error: 'Cannot decline a session that is not pending' });
      }
    } else if (status === 'cancelled') {
      // Both teachers and students can cancel sessions
      if (sessionData.status !== 'pending' && sessionData.status !== 'accepted') {
        return res.status(400).json({ error: 'Cannot cancel a session that is not pending or accepted' });
      }
    } else if (status === 'completed') {
      // Both teachers and students can mark sessions as completed
      if (sessionData.status !== 'accepted') {
        return res.status(400).json({ error: 'Cannot mark a session as completed that was not accepted' });
      }
    }
    
    // Update the session status
    const updates = {
      status,
      updated_at: new Date().toISOString()
    };
    
    // Add meeting link if provided
    if (meetingLink) {
      updates.meeting_link = meetingLink;
    }
    
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select();
      
    if (error) throw error;
    
    // Create notification for the other user
    const notificationRecipientId = userId === sessionData.teacher_id ? 
      sessionData.student_id : sessionData.teacher_id;
    
    let notificationTitle, notificationDesc, notificationType;
    
    switch (status) {
      case 'accepted':
        notificationTitle = 'Session Request Accepted';
        notificationDesc = `Your session request has been accepted. Use this link to join: ${meetingLink}`;
        notificationType = 'session_accepted';
        break;
      case 'declined':
        notificationTitle = 'Session Request Declined';
        notificationDesc = 'Your session request has been declined.';
        notificationType = 'session_declined';
        break;
      case 'cancelled':
        notificationTitle = 'Session Cancelled';
        notificationDesc = 'A session you were part of has been cancelled.';
        notificationType = 'session_cancelled';
        break;
      case 'completed':
        notificationTitle = 'Session Completed';
        notificationDesc = 'A session you were part of has been marked as completed.';
        notificationType = 'session_completed';
        break;
    }
    
    if (notificationTitle) {
      const notification = {
        user_id: notificationRecipientId,
        title: notificationTitle,
        description: notificationDesc,
        type: notificationType,
        action_url: `/profile?tab=sessions`
      };
      
      await supabase
        .from('notifications')
        .insert([notification]);
    }
    
    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error updating session status:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserSessions,
  getSessionById,
  createSession,
  updateSessionStatus
};
