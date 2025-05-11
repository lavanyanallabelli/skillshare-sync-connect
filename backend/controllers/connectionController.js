
const Connection = require('../models/Connection');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Get user connections
// @route   GET /api/connections
// @access  Private
const getConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get accepted connections
    const connections = await Connection.find({
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status: 'accepted'
    }).sort({ updatedAt: -1 });
    
    // Populate user details
    const populatedConnections = await Promise.all(
      connections.map(async (connection) => {
        const requesterId = connection.requesterId.toString();
        const recipientId = connection.recipientId.toString();
        
        const requester = await User.findById(requesterId).select('firstName lastName avatar');
        const recipient = await User.findById(recipientId).select('firstName lastName avatar');
        
        return {
          id: connection._id,
          status: connection.status,
          requesterId,
          recipientId,
          requesterName: requester ? `${requester.firstName} ${requester.lastName}` : 'Unknown',
          recipientName: recipient ? `${recipient.firstName} ${recipient.lastName}` : 'Unknown',
          requesterAvatar: requester?.avatar,
          recipientAvatar: recipient?.avatar,
          createdAt: connection.createdAt
        };
      })
    );
    
    res.status(200).json(populatedConnections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get pending connection requests
// @route   GET /api/connections/pending
// @access  Private
const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get pending connection requests
    const pendingRequests = await Connection.find({
      recipientId: userId,
      status: 'pending'
    }).sort({ createdAt: -1 });
    
    // Populate requester details
    const populatedRequests = await Promise.all(
      pendingRequests.map(async (request) => {
        const requester = await User.findById(request.requesterId).select('firstName lastName avatar');
        
        return {
          id: request._id,
          status: request.status,
          requesterId: request.requesterId,
          recipientId: request.recipientId,
          requesterName: requester ? `${requester.firstName} ${requester.lastName}` : 'Unknown',
          requesterAvatar: requester?.avatar,
          createdAt: request.createdAt
        };
      })
    );
    
    res.status(200).json(populatedRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Send connection request
// @route   POST /api/connections
// @access  Private
const sendConnectionRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user.id;
    
    if (!recipientId) {
      return res.status(400).json({ error: 'Missing recipient ID' });
    }
    
    // Check if users are the same
    if (requesterId === recipientId) {
      return res.status(400).json({ error: 'Cannot connect with yourself' });
    }
    
    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requesterId, recipientId },
        { requesterId: recipientId, recipientId: requesterId }
      ]
    });
    
    if (existingConnection) {
      return res.status(400).json({ 
        error: 'Connection already exists', 
        status: existingConnection.status 
      });
    }
    
    // Create connection request
    const connection = await Connection.create({
      requesterId,
      recipientId,
      status: 'pending'
    });
    
    // Create notification for recipient
    const requester = await User.findById(requesterId).select('firstName lastName');
    const requesterName = requester ? `${requester.firstName} ${requester.lastName}` : 'Someone';
    
    await Notification.create({
      userId: recipientId,
      type: 'connection_request',
      title: 'New Connection Request',
      description: `${requesterName} wants to connect with you.`,
      actionUrl: '/profile?tab=connections',
      iconType: 'user-plus'
    });
    
    res.status(201).json(connection);
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Respond to connection request
// @route   PUT /api/connections/:connectionId/respond
// @access  Private
const respondToRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { accept } = req.body;
    const userId = req.user.id;
    
    if (typeof accept !== 'boolean') {
      return res.status(400).json({ error: 'Missing accept parameter' });
    }
    
    // Find the connection
    const connection = await Connection.findById(connectionId);
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }
    
    // Check if user is the recipient
    if (connection.recipientId.toString() !== userId) {
      return res.status(401).json({ error: 'Not authorized to respond to this connection request' });
    }
    
    // Update connection status
    connection.status = accept ? 'accepted' : 'declined';
    await connection.save();
    
    // Create notification for requester
    const recipient = await User.findById(userId).select('firstName lastName');
    const recipientName = recipient ? `${recipient.firstName} ${recipient.lastName}` : 'Someone';
    
    await Notification.create({
      userId: connection.requesterId,
      type: accept ? 'connection_accepted' : 'connection_declined',
      title: accept ? 'Connection Accepted' : 'Connection Declined',
      description: accept 
        ? `${recipientName} has accepted your connection request.` 
        : `${recipientName} has declined your connection request.`,
      actionUrl: accept ? '/profile?tab=connections' : null,
      iconType: accept ? 'user-check' : 'user-x'
    });
    
    res.status(200).json(connection);
  } catch (error) {
    console.error('Error responding to connection request:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Remove connection
// @route   DELETE /api/connections/:connectionId
// @access  Private
const removeConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;
    
    // Find the connection
    const connection = await Connection.findById(connectionId);
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    // Check if user is part of the connection
    if (connection.requesterId.toString() !== userId && connection.recipientId.toString() !== userId) {
      return res.status(401).json({ error: 'Not authorized to remove this connection' });
    }
    
    await connection.remove();
    
    res.status(200).json({ success: true, message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getConnections,
  getPendingRequests,
  sendConnectionRequest,
  respondToRequest,
  removeConnection
};
