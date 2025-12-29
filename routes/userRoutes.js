const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
  console.log('--- Entering User Routes ---');
  console.log('User Route Path:', req.path);
  next();
});
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { protect } = require('../middleware/authMiddleware');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/'
};


// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Password Validation
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ success: false, message: 'Password must contain at least one uppercase letter' });
  }
  if (!/[a-z]/.test(password)) {
    return res.status(400).json({ success: false, message: 'Password must contain at least one lowercase letter' });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ success: false, message: 'Password must contain at least one number' });
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return res.status(400).json({ success: false, message: 'Password must contain at least one symbol' });
  }
  if (name && password.toLowerCase() === name.toLowerCase()) {
    return res.status(400).json({ success: false, message: 'Password cannot be the same as your name' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      const token = generateToken(user._id);



// ... inside register route ...
      res.cookie('jwt', token, cookieOptions);

// ... inside login route ...
      res.cookie('jwt', token, cookieOptions);

// ... inside logout route ...
router.post('/logout', (req, res) => {
  res.cookie('jwt', '', { ...cookieOptions, maxAge: 0, expires: new Date(0) });
  
  res.setHeader('Clear-Site-Data', '"cookies", "storage"');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ... inside google auth callback ...
    res.cookie('jwt', token, cookieOptions);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      const token = generateToken(user._id);

      res.cookie('jwt', token, cookieOptions);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
router.post('/logout', (req, res) => {
  // 1. Clear with current global options
  res.cookie('jwt', '', { ...cookieOptions, maxAge: 0, expires: new Date(0) });

  // 2. Clear with 'Production' style (Secure, None)
  res.cookie('jwt', '', { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'None', 
    expires: new Date(0),
    path: '/' 
  });
  
  // 3. Clear with 'Dev' style (Not Secure, Lax)
  res.cookie('jwt', '', { 
    httpOnly: true, 
    secure: false, 
    sameSite: 'Lax', 
    expires: new Date(0),
    path: '/' 
  });

  // 4. Clear matching possible router mount paths
  res.clearCookie('jwt', { path: '/api/users' });
  res.clearCookie('jwt', { path: '/api' });
  
  // 5. Clear default (no path, just in case)
  res.clearCookie('jwt');
  
  // Force client to clear data
  res.setHeader('Clear-Site-Data', '"cookies", "storage"');
  
  res.status(200).json({ success: true, message: 'Logged out successfully' });
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
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
// Debugging Protect Middleware
console.log('Protect Type:', typeof protect);

router.get('/profile', (req, res, next) => {
  console.log('--- Inside Profile Route Handler (Pre-Protect) ---');
  next();
}, protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.set('ETag', false); // Disable ETag to prevent 304
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
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
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// @desc    Get all users (with optional role filter)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Not authorized' });
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
        res.status(500).json({ success: false, message: error.message });
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
    
    // Redirect with token in URL (Old behavior for localStorage)
    res.cookie('jwt', token, cookieOptions);
    
    // Determine frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Redirect with token in URL (Cookie fallback is unreliable across domains)
    res.redirect(`${frontendUrl}/login?success=true&token=${token}`);
  }
);

// @desc    Forgot Password
// @route   POST /api/users/forgotpassword
// @access  Public
router.post('/forgotpassword', async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ success: false, error: 'There is no user with that email.' }); // Don't leak exists/not exists in prod usually, but fine here
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  // Assuming frontend is localhost:3000 for now, or match env
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
      html: `
        <h1>You have requested a password reset</h1>
        <p>Please go to this link to reset your password:</p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      `
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Reset Password
// @route   PUT /api/users/resetpassword/:resetToken
// @access  Public
router.put('/resetpassword/:resetToken', async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid token' });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(201).json({
    success: true,
    data: 'Password Updated Success',
    token: generateToken(user._id),
  });
});


module.exports = router;
