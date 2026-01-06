const express = require('express');
const router = express.Router();
const Poster = require('../models/Poster');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../utils/supabase');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToSupabase = async (file, folder = 'posters') => {
  const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET || 'journal-files')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET || 'journal-files')
    .getPublicUrl(fileName);

  return publicUrl;
};




// @desc    Upload a new poster
// @route   POST /api/posters
// @access  Private/Admin
router.post('/', protect, admin, upload.single('poster'), async (req, res) => {
  try {
    // 1. Delete existing posters (since only one is allowed)
    await Poster.deleteMany({});

    // 2. Clear old poster files (Optional: Implement file deletion logic here if needed)

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // Set to expire in 7 days

    const publicUrl = await uploadToSupabase(req.file, 'posters');

    const poster = await Poster.create({
      imageUrl: publicUrl,
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
