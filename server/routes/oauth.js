import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.js';

const router = express.Router();

// Google OAuth callback
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ 
        success: false,
        error: 'Google credential is required' 
      });
    }

    // Verify Google token (in production, use Google's token verification)
    // For now, we'll decode the JWT token
    try {
      // Decode without verification for demo (in production, verify with Google)
      const decoded = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
      
      const { email, name, picture, sub } = decoded;

      // Check if user exists
      let user = await User.findOne({ 
        $or: [
          { email: email.toLowerCase() },
          { googleId: sub }
        ]
      });

      if (!user) {
        // Create new user
        user = await User.create({
          name: name || email.split('@')[0],
          email: email.toLowerCase(),
          googleId: sub,
          password: '' // OAuth users don't need password
        });
      } else if (!user.googleId) {
        // Update existing user with Google ID
        user.googleId = sub;
        await user.save();
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            picture: picture || ''
          },
          token
        }
      });

    } catch (error) {
      console.error('Google token decode error:', error);
      res.status(401).json({ 
        success: false,
        error: 'Invalid Google token' 
      });
    }

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to authenticate with Google',
      message: error.message
    });
  }
});

// Apple Sign In callback
router.post('/apple', async (req, res) => {
  try {
    const { id_token, user } = req.body;

    if (!id_token) {
      return res.status(400).json({ 
        success: false,
        error: 'Apple token is required' 
      });
    }

    // Verify Apple token (in production, use Apple's token verification)
    try {
      // Decode without verification for demo (in production, verify with Apple)
      const decoded = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
      
      const email = decoded.email || user?.email;
      const name = user?.name || email?.split('@')[0] || 'User';
      const sub = decoded.sub;

      // Check if user exists
      let userRecord = await User.findOne({ 
        $or: [
          { email: email?.toLowerCase() },
          { appleId: sub }
        ]
      });

      if (!userRecord) {
        // Create new user
        userRecord = await User.create({
          name: name,
          email: email?.toLowerCase() || '',
          appleId: sub,
          password: '' // OAuth users don't need password
        });
      } else if (!userRecord.appleId) {
        // Update existing user with Apple ID
        userRecord.appleId = sub;
        await userRecord.save();
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: userRecord._id.toString(), email: userRecord.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: userRecord._id.toString(),
            name: userRecord.name,
            email: userRecord.email
          },
          token
        }
      });

    } catch (error) {
      console.error('Apple token decode error:', error);
      res.status(401).json({ 
        success: false,
        error: 'Invalid Apple token' 
      });
    }

  } catch (error) {
    console.error('Apple OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to authenticate with Apple',
      message: error.message
    });
  }
});

export default router;
