const express = require("express");
const router = express.Router();
const axios = require("axios");
require('dotenv').config();

router.get("/linkedin", (req, res) => {
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=http://localhost:8000/api/auth/linkedin/callback&scope=profile%20email%20openid`;
  res.redirect(authUrl);
});


router.get("/linkedin/callback", async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange code for access token
    const tokenRes = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", null, {
      params: {
        grant_type: "authorization_code",
        code,
        redirect_uri: 'http://localhost:8000/api/auth/linkedin/callback',
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      },
    });

    const accessToken = tokenRes.data.access_token;

    // Get user profile
    const profileRes = await axios.get("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Get user email
    const emailRes = await axios.get("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(profileRes)
    console.log(emailRes)

    const user = {
      name: `${profileRes.data.localizedFirstName} ${profileRes.data.localizedLastName}`,
      email: emailRes.data.elements[0]["handle~"].emailAddress,
    };

    console.log("LinkedIn User:", user);
    

    // 👉 Store user in DB or issue JWT here

    res.redirect("http://localhost:5173");
  } catch (err) {
    console.error("LinkedIn OAuth error:", err.response?.data || err.message);
    res.status(500).send("LinkedIn login failed");
  }
});

module.exports = router;
