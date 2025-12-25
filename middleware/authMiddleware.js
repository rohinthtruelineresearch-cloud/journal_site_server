const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
    } catch (error) {
       console.error('Auth Error:', error);
    }
  } 
  // Fallback to cookie if no header
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Explicitly check for "null" string which happens if frontend sends "Bearer null"
  if (token && token !== 'undefined' && token !== 'null') {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Auth Error:', error.message); // Log message only, not full stack
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
