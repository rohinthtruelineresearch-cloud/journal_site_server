const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Create a new notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { title, message, type, targetRoles, link } = req.body;

  try {
    const notification = await Notification.create({
      title,
      message,
      type: type || 'info',
      targetRoles: targetRoles || ['all'],
      link,
      createdBy: req.user._id,
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // Find notifications that target this user's role, 'all', OR them specifically
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user._id },
        { 
          $and: [
            { recipient: null },
            { $or: [{ targetRoles: 'all' }, { targetRoles: userRole }] }
          ]
        }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('createdBy', 'name');

    // Add 'isRead' field for each notification
    const notificationsWithReadStatus = notifications.map(notif => ({
      _id: notif._id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      link: notif.link,
      createdAt: notif.createdAt,
      createdBy: notif.createdBy,
      isRead: notif.readBy.includes(req.user._id),
    }));

    res.json(notificationsWithReadStatus);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const userRole = req.user.role;
    
    const count = await Notification.countDocuments({
      $or: [
        { recipient: req.user._id },
        { 
          $and: [
            { recipient: null },
            { $or: [{ targetRoles: 'all' }, { targetRoles: userRole }] }
          ]
        }
      ],
      readBy: { $ne: req.user._id }
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Add user to readBy if not already there
    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    const userRole = req.user.role;
    
    await Notification.updateMany(
      {
        $or: [
          { recipient: req.user._id },
          { 
            $and: [
              { recipient: null },
              { $or: [{ targetRoles: 'all' }, { targetRoles: userRole }] }
            ]
          }
        ],
        readBy: { $ne: req.user._id }
      },
      {
        $addToSet: { readBy: req.user._id }
      }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a notification (Admin only)
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.deleteOne();
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all notifications (Admin view)
// @route   GET /api/notifications/admin
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name');

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
