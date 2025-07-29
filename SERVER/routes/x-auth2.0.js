const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

// PKCE values (in production, store them securely per session)
const code_verifier = "simple_code_verifier"; // Replace with securely generated random string
const code_challenge = "simple_code_verifier"; // Use S256 or plain (same value here for plain)

router.get("/x", (req, res) => {
  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.X_CLIENT_ID}&redirect_uri=${encodeURIComponent("http://localhost:8000/api/auth/x/callback")}&scope=tweet.read%20users.read%20offline.access&state=your_random_state&code_challenge=${code_challenge}&code_challenge_method=plain`;
  res.redirect(authUrl);
});


router.get("/x/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) return res.send("Authorization code missing.");

  try {
    // Step 1: Exchange the code for access token
    const tokenResponse = await axios.post("https://api.twitter.com/2/oauth2/token", null, {
      params: {
        grant_type: "authorization_code",
        client_id: process.env.X_CLIENT_ID,
        redirect_uri: "http://localhost:8000/api/auth/x/callback",
        code,
        code_verifier: code_verifier 
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    const access_token = tokenResponse.data.access_token;
    const userResponse = await axios.get("https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username", {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const user = userResponse.data;
    console.log("Twitter User:", user);

    res.redirect("http://localhost:5173");
  } catch (error) {
    console.error("Twitter OAuth Error", error.response?.data || error.message);
    res.status(500).send("Twitter login failed.");
  }
});


module.exports = router;