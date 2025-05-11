
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:notificationId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    // Find notification
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check if user owns the notification
    if (notification.userId.toString() !== userId) {
      return res.status(401).json({ error: 'Not authorized to update this notification' });
    }
    
    // Mark as read
    notification.read = true;
    await notification.save();
    
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Update all unread notifications
    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
  try {
    const { userId, type, title, description, actionUrl, iconType } = req.body;
    
    // Check for required fields
    if (!userId || !type || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const notification = await Notification.create({
      userId,
      type,
      title,
      description: description || '',
      actionUrl: actionUrl || '',
      iconType: iconType || '',
      read: false
    });
    
    res.status(201).json(notification);
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
