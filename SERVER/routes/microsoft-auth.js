const express = require('express');
const passport = require('../config/passport-microsoft');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { RefreshToken } = require('../model/refreshToken');

const router = express.Router();

router.get('/microsoft',
  passport.authenticate('azuread-openidconnect', { failureRedirect: 'http://localhost:5173/signin' }),
  (req, res) => {
    // Successful authentication, redirect home.
    console.log(req);
  }
);

router.get('/microsoft/callback',
  // (req, res, next) => {console.log("microsoft callback", req.body); next();},
  passport.authenticate('azuread-openidconnect', { failureRedirect: 'http://localhost:5173/signin' }),
  async (req, res) => {
    console.log(req.user)
    res.json({ message: 'Authentication successful', user: req });
    // res.redirect('http://localhost:8000/api/auth/microsoft/success');
  }
);

router.get('/microsoft/success', async (req, res) => {
      // console.log('Auth success:', req.user);
      console.log("auth", req.user)
      const userId = req.user._id;
  
      const accessToken = generateAccessToken(userId, 'user');
      const refreshTokenStr = generateRefreshToken(userId);
  
      await RefreshToken.create({
        token: refreshTokenStr,
        userId,
        expiresAt: new Date(Date.now() + 7*24*60*60*1000)
      });
  
      console.log(accessToken, refreshTokenStr);
  
      res.cookie('accessToken', accessToken, {
        domain: "localhost",
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });
      res.cookie('refreshToken', refreshTokenStr, {
        domain: "localhost",
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });
  
      res.json({
        success: true,
        message: 'Authentication successful',
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          profilePicture: req.user.profilePicture,
        },
      });
  res.redirect('http://localhost:5173');
});


module.exports = router;
