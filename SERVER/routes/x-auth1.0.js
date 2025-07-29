const express = require("express");
const router = express.Router();
require("dotenv").config();
const OAuth = require("oauth").OAuth;
const bcrypt = require('bcrypt');
const { User } = require("../model/user");
const { RefreshToken } = require("../model/refreshToken");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const oa = new OAuth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  process.env.X_CONSUMER_KEY,
  process.env.X_CONSUMER_SECRET,
  "1.0A",
  "http://localhost:8000/api/auth/x/callback",
  "HMAC-SHA1"
);

router.get("/x", (req, res) => {
  oa.getOAuthRequestToken((err, oauth_token, oauth_token_secret) => {
    if (err) return res.status(500).send(err);
    res.cookie("oauth_token_secret", oauth_token_secret, { httpOnly: true });
    res.redirect(
      `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`
    );
  });
});

router.get("/x/callback", async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;
  const oauth_token_secret = req.cookies.oauth_token_secret;

  oa.getOAuthAccessToken(
    oauth_token,
    oauth_token_secret,
    oauth_verifier,
    (err, access_token, access_token_secret) => {
      if (err) return res.status(500).send(err);

      // Now fetch profile with email
      oa.get(
        "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
        access_token,
        access_token_secret,
        async (err, data) => {
          if (err) return res.status(500).send(err);
          const info = JSON.parse(data);
          const user = await User.findOne({ email: info.email });
          if (!user) {
            const newUser = new User({
              name: info.name,
              email: info.email,
              password: bcrypt.hashSync( Math.random().toString(36).slice(-8), 12),
              profilePicture: info.profile_image_url_https,
            });
            await newUser.save();
          }

          const access_token = await generateAccessToken(user._id, "user");
          const refreshTokenStr = await generateRefreshToken(user._id);

          await RefreshToken.create({
            token: refreshTokenStr,
            userId: user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          });

          res.cookie("accessToken", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          });
          res.cookie("refreshToken", refreshTokenStr, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          });
          res.redirect(`http://localhost:5173`);
        }
      );
    }
  );
});

module.exports = router;
