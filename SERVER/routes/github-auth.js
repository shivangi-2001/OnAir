const express = require("express");
const router = express.Router();
require("dotenv").config();
const axios = require("axios");
const bcrypt = require("bcrypt");
const { User } = require("../model/user");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const { RefreshToken } = require("../model/refreshToken");

router.get("/github", (req, res) => {
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user`;
  res.redirect(redirectUri);
});

router.get("/github/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userEmail = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = await User.findOne({ email: userEmail.data[0].email });
    if (!user) {
      const newUser = new User({
        name: userRes.data.name || userRes.data.login,
        email: userEmail.data[0].email,
        password: bcrypt.hashSync(Math.random().toString(36).slice(-8), 12),
        profilePicture: userRes.data.avatar_url,
      });
      await newUser.save();
    }

    const access_token = await generateAccessToken(user._id, "user");
    const refreshTokenStr = await generateRefreshToken(user._id);

    await RefreshToken.create({
      token: refreshTokenStr,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

    res.redirect(`http://localhost:5173/`);
  } catch (error) {
    console.error("OAuth error:", error.message);
    res.status(500).send("OAuth Failed");
  }
});

module.exports = router;
