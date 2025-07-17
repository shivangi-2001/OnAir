const express = require("express");
const router = express.Router();
require("dotenv").config();
const axios = require("axios");
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { RefreshToken } = require('../model/refreshToken');
const { User } = require("../model/user");
const bcrypt = require("bcrypt");


router.get("/facebook", (req, res) => {
  const fbUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${
    process.env.FACEBOOK_APP_ID
  }&redirect_uri=${"http://localhost:8000/api/auth/facebook/callback"}&scope=email,public_profile`;
  res.redirect(fbUrl);
});

router.get("/facebook/callback", async (req, res) => {
  const code = req.query.code;

  const tokenRes = await axios.get(
    `https://graph.facebook.com/v12.0/oauth/access_token`,
    {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: "http://localhost:8000/api/auth/facebook/callback",
        code,
      },
    }
  );

  const accessToken = tokenRes.data.access_token;

  const userRes = await axios.get(
    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
  );

  const user = await User.findOne({ email: userRes.data.email });
  if (!user) {
    const newUser = new User({
      name: userRes.data.name,
      email: userRes.data.email,
      password: bcrypt.hashSync(Math.random().toString(36).slice(-8), 12),
      profilePicture: userRes.data.picture.data.url,
    });
    await newUser.save();
  }
  const access_token = await generateAccessToken(user._id, "user");
  const refreshTokenStr = await generateRefreshToken(user._id);

  await RefreshToken.create({
    token: refreshTokenStr,
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  })

  res.cookie('accessToken', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.cookie('refreshToken', refreshTokenStr, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.redirect(`http://localhost:5173`);
});

module.exports = router;
