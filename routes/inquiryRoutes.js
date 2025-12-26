const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Submit a new inquiry
// @route   POST /api/inquiries
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, submissionId, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please provide name, email and message' });
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      submissionId,
      message
    });

    res.status(201).json({
      message: 'Inquiry submitted successfully',
      inquiry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    inquiry.status = req.body.status || inquiry.status;
    const updatedInquiry = await inquiry.save();

    res.json(updatedInquiry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
