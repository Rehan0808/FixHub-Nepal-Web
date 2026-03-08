const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Import your existing auth middleware (adjust the path based on your structure)
// Common locations: ../middleware/auth.js, ../middleware/authMiddleware.js, ../middlewares/auth.js
const { protect } = require('../middleware/auth'); // Adjust this import based on your actual auth middleware file

// @desc    Get all messages for current user
// @route   GET /api/messages
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    console.log('Fetching messages for user:', req.user._id);

    // Get messages where:
    // 1. User is the sender, OR
    // 2. Message is from admin (broadcast to all or specific to this user)
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id },
        { isAdmin: true }
      ]
    })
    .sort({ timestamp: 1 }) // Oldest first for chat order
    .lean();

    console.log('Found messages:', messages.length);

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { message } = req.body;

    console.log('Sending message from user:', req.user._id);
    console.log('Message content:', message);

    // Validation
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Create new message
    const newMessage = await Message.create({
      message: message.trim(),
      senderId: req.user._id,
      senderName: req.user.fullName || req.user.name || 'User',
      isAdmin: false,
      timestamp: new Date()
    });

    console.log('Message created:', newMessage._id);

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// @desc    Admin: Send message to specific user or broadcast
// @route   POST /api/messages/admin
// @access  Private/Admin
router.post('/admin', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.isAdmin !== true) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    const { message, userId } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Create admin message
    // If userId is provided, it's a reply to that specific user
    // Otherwise, it's a broadcast to all users
    const newMessage = await Message.create({
      message: message.trim(),
      senderId: userId || req.user._id,
      senderName: 'Admin Support',
      isAdmin: true,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending admin message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// @desc    Get all chat conversations (Admin only)
// @route   GET /api/messages/admin/conversations
// @access  Private/Admin
router.get('/admin/conversations', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.isAdmin !== true) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    // Get unique users who have sent messages
    const conversations = await Message.aggregate([
      { $match: { isAdmin: false } },
      {
        $group: {
          _id: '$senderId',
          lastMessage: { $last: '$message' },
          lastTimestamp: { $last: '$timestamp' },
          senderName: { $last: '$senderName' },
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { lastTimestamp: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
});

// @desc    Get messages for a specific user (Admin only)
// @route   GET /api/messages/admin/user/:userId
// @access  Private/Admin
router.get('/admin/user/:userId', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.isAdmin !== true) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { senderId: userId, isAdmin: true }
      ]
    })
    .sort({ timestamp: 1 })
    .lean();

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

module.exports = router;
