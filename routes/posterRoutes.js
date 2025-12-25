const express = require('express');
const router = express.Router();
const Poster = require('../models/Poster');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = 'uploads/posters/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `poster-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

// @desc    Upload a new poster
// @route   POST /api/posters
// @access  Private/Admin
router.post('/', protect, admin, upload.single('poster'), async (req, res) => {
  try {
    // 1. Delete existing posters (since only one is allowed)
    await Poster.deleteMany({});

    // 2. Clear old poster files from directory to save space
    const posterDir = 'uploads/posters/';
    if (!fs.existsSync(posterDir)) {
        fs.mkdirSync(posterDir, { recursive: true });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // Set to expire in 7 days

    const poster = await Poster.create({
      imageUrl: req.file.path.replace(/\\/g, '/').replace('uploads/', ''),
      expiresAt: expiryDate,
      uploadedBy: req.user._id,
    });

    res.status(201).json(poster);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get active poster
// @route   GET /api/posters/active
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const poster = await Poster.findOne({
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!poster) {
      return res.json(null);
    }

    res.json(poster);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Remove current poster
// @route   DELETE /api/posters/active
// @access  Private/Admin
router.delete('/active', protect, admin, async (req, res) => {
  try {
    await Poster.deleteMany({});
    res.json({ message: 'Poster removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
