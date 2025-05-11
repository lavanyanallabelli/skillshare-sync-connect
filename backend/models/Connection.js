
const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Ensure uniqueness between requester and recipient
connectionSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);
