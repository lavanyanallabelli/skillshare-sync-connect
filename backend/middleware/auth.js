
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabaseClient');

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
      // Verify token using Supabase JWT
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        return res.status(401).json({ error: 'Not authorized, token failed' });
      }

      // Set user in request object
      req.user = data.user;
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { protect };
