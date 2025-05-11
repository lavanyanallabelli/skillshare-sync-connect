
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get conversations
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all users the current user has exchanged messages with
    const sentToUsers = await Message.distinct('receiverId', { senderId: userId });
    const receivedFromUsers = await Message.distinct('senderId', { receiverId: userId });
    
    // Combine and remove duplicates
    const conversationUserIds = [...new Set([...sentToUsers, ...receivedFromUsers])];
    
    if (conversationUserIds.length === 0) {
      return res.status(200).json([]);
    }
    
    // Get user details and last messages
    const conversations = await Promise.all(
      conversationUserIds.map(async (partnerId) => {
        // Get partner profile
        const partner = await User.findById(partnerId).select('firstName lastName avatar');
        
        if (!partner) return null;
        
        // Get most recent message
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId }
          ]
        }).sort({ createdAt: -1 });
        
        // Count unread messages
        const unreadCount = await Message.countDocuments({
          senderId: partnerId,
          receiverId: userId,
          readAt: null
        });
        
        return {
          userId: partnerId,
          userName: `${partner.firstName} ${partner.lastName}`,
          userAvatar: partner.avatar,
          lastMessage: lastMessage?.content,
          lastMessageDate: lastMessage?.createdAt,
          unreadCount
        };
      })
    );
    
    // Filter out null values
    const validConversations = conversations.filter(conv => conv !== null);
    
    res.status(200).json(validConversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get messages between two users
// @route   GET /api/messages/:partnerId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user.id;
    
    // Get messages
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { senderId: partnerId, receiverId: userId, readAt: null },
      { $set: { readAt: new Date() } }
    );
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    
    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const message = await Message.create({
      senderId,
      receiverId,
      content,
      readAt: null
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Message.countDocuments({
      receiverId: userId,
      readAt: null
    });
    
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error getting unread message count:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount
};
