const express = require('express');
const passport = require('../config/passport-google');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { RefreshToken } = require('../model/refreshToken');

const router = express.Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/signin' }),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const accessToken = generateAccessToken(userId, 'user');
      const refreshTokenStr = generateRefreshToken(userId);
  
      await RefreshToken.create({
        token: refreshTokenStr,
        userId,
        expiresAt: new Date(Date.now() + 7*24*60*60*1000)
      });
  
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });
      res.cookie('refreshToken', refreshTokenStr, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });
  
      res.redirect('http://localhost:5173/');
    } catch (err) {
      console.error(err);
      res.redirect('http://localhost:5173/signin');
    }
  }
);



module.exports = router;
