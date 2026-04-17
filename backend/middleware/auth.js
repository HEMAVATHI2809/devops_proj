const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.error('No token provided in request headers');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.error('User not found for token');
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ 
        message: 'Invalid token',
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error during authentication',
      error: error.message 
    });
  }
};

const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    console.error(`Admin access denied for user ${req.user._id} with role ${req.user.role}`);
    return res.status(403).json({ 
      message: 'Access denied. Admin role required.',
      userRole: req.user.role
    });
  }
  next();
};

const customerAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'customer') {
    console.error(`Customer access denied for user ${req.user._id} with role ${req.user.role}`);
    return res.status(403).json({ 
      message: 'Access denied. Customer role required.',
      userRole: req.user.role
    });
  }
  next();
};

const providerAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'provider') {
    console.error(`Provider access denied for user ${req.user._id} with role ${req.user.role}`);
    return res.status(403).json({ 
      message: 'Access denied. Provider role required.',
      userRole: req.user.role
    });
  }
  next();
};

const providerOrAdminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'provider' && req.user.role !== 'admin') {
    console.error(`Provider/Admin access denied for user ${req.user._id} with role ${req.user.role}`);
    return res.status(403).json({ 
      message: 'Access denied. Provider or Admin role required.',
      userRole: req.user.role
    });
  }
  next();
};

module.exports = { auth, adminAuth, customerAuth, providerAuth, providerOrAdminAuth };
