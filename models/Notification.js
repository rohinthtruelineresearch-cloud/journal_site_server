const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'important', 'update'],
    default: 'info',
  },
  // Who can see this notification
  targetRoles: [{
    type: String,
    enum: ['author', 'reviewer', 'all'],
    default: 'all',
  }],
  // Users who have read this notification
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Who created this notification (admin/editor)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Optional link to navigate to
  link: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for performance
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ targetRoles: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
