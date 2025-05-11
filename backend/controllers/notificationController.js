
const { supabase } = require('../config/supabaseClient');

// Get notifications for the current user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    // Verify the notification belongs to the user
    const { data: notificationData, error: fetchError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Check if notification exists and belongs to user
    if (!notificationData) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (notificationData.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this notification' });
    }
    
    // Update the notification
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select();
      
    if (error) throw error;
    
    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read for the current user
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false)
      .select();
      
    if (error) throw error;
    
    res.status(200).json({ message: 'All notifications marked as read', count: data.length });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { userId, title, description, type, actionUrl } = req.body;
    
    if (!userId || !title || !type) {
      return res.status(400).json({ error: 'Missing required fields: userId, title, and type are required' });
    }
    
    const notification = {
      user_id: userId,
      title,
      description,
      type,
      action_url: actionUrl,
      read: false
    };
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select();
      
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
};
