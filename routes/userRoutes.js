const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth with Google
// @route   GET /api/users/auth/google
// @access  Public
router.get(
  '/auth/google',
  (req, res, next) => {
    const state = req.query.from;
    const authenticator = passport.authenticate('google', { 
      scope: ['profile', 'email'],
      state: state
    });
    authenticator(req, res, next);
  }
);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    // Update additional profile fields
    user.orcid = req.body.orcid || user.orcid;
    user.workplace = req.body.workplace || user.workplace;
    user.jobType = req.body.jobType || user.jobType;
    user.title = req.body.title || user.title;
    user.firstName = req.body.firstName || user.firstName;
    user.middleName = req.body.middleName || user.middleName;
    user.lastName = req.body.lastName || user.lastName;
    user.facebook = req.body.facebook || user.facebook;
    user.twitter = req.body.twitter || user.twitter;
    user.affiliation = req.body.affiliation || user.affiliation;
    user.address1 = req.body.address1 || user.address1;
    user.address2 = req.body.address2 || user.address2;
    user.zipCode = req.body.zipCode || user.zipCode;
    user.city = req.body.city || user.city;
    user.country = req.body.country || user.country;
    user.biography = req.body.biography || user.biography;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
      // Return all profile fields
        orcid: updatedUser.orcid,
        workplace: updatedUser.workplace,
        jobType: updatedUser.jobType,
        title: updatedUser.title,
        firstName: updatedUser.firstName,
        middleName: updatedUser.middleName,
        lastName: updatedUser.lastName,
        facebook: updatedUser.facebook,
        twitter: updatedUser.twitter,
        affiliation: updatedUser.affiliation,
        address1: updatedUser.address1,
        address2: updatedUser.address2,
        zipCode: updatedUser.zipCode,
        city: updatedUser.city,
        country: updatedUser.country,
        biography: updatedUser.biography,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // Return all profile fields
        orcid: user.orcid,
        workplace: user.workplace,
        jobType: user.jobType,
        title: user.title,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        facebook: user.facebook,
        twitter: user.twitter,
        affiliation: user.affiliation,
        address1: user.address1,
        address2: user.address2,
        zipCode: user.zipCode,
        city: user.city,
        country: user.country,
        biography: user.biography,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Get all users (with optional role filter)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
    }

    try {
        const { role } = req.query;
        let query = {};
        if (role) {
            query.role = role;
        }
        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Google auth callback
// @route   GET /api/users/auth/google/callback
// @access  Public
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user._id);
    let frontendUrl = req.query.state;

    // Validate and Clean the URL
    // Default to env var or localhost if state is missing or invalid
    const allowedOrigins = [
      'http://localhost:3000',
      'https://aurorajournal.netlify.app'
    ];
    // Add current env frontend url if exists
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }

    let isValid = false;
    if (frontendUrl) {
      try {
        const urlObj = new URL(frontendUrl);
        if (allowedOrigins.includes(urlObj.origin)) {
           isValid = true;
        }
      } catch (e) {
        // invalid url
      }
    }

    if (!isValid) {
        frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    }

    res.redirect(`${frontendUrl}/login?token=${token}`);
  }
);

module.exports = router;
