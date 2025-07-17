const { refreshTokenExpiresIn } = require("../config");
const { RefreshToken } = require("../model/refreshToken");
const { User } = require("../model/user");
const jwtUtils = require("../utils/jwt");
const path = require('path');
const fs = require('fs');
const getProfileImageUrl = require("../utils/get_image_url");

// Helper to convert "7d" to ms
function parseRefreshExpiry(value) {
  const days = parseInt(value);
  return days * 24 * 60 * 60 * 1000;
}


module.exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    let profileFilename = null;

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const safeName = name.toLowerCase().replace(/\s+/g, "-"); 
      profileFilename = `${safeName}-${Date.now()}${ext}`;

      const oldPath = req.file.path;
      const newPath = path.join(path.dirname(oldPath), profileFilename);

      fs.renameSync(oldPath, newPath);
    }

    await User.create({ name, email, password, profilePicture: profileFilename || undefined,});

    return res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Registering error", error: error.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required!" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = jwtUtils.generateAccessToken(user._id, "user");
    const refreshTokenStr = jwtUtils.generateRefreshToken(user._id);

    // Save refresh token to DB
    await RefreshToken.create({
      token: refreshTokenStr,
      userId: user._id,
      expiresAt: new Date(
        Date.now() + parseRefreshExpiry(refreshTokenExpiresIn)
      ),
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

    return res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Login error", err: err.message });
  }
};

module.exports.profile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.sub });
    if(!user) return res.status(400).json({ message: "User not found"})
    return res.json({
      name: user.name,
      email: user.email,
      profile: getProfileImageUrl(user.profilePicture),
    });
  } catch (error) {
    res.status(500).json({ message: "Profile error", err: error.message });
  }
};

module.exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(400).json({ message: "No refresh token" });

    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      revoked: false,
    });
    if (!storedToken)
      return res.status(401).json({ message: "Invalid refresh token" });

    const payload = jwtUtils.verifyRefreshToken(refreshToken);
    const newAccessToken = jwtUtils.generateAccessToken(payload.sub, "user");

    // Rotate refresh token so the old one cannot be used again
    storedToken.revoked = true;
    await storedToken.save();

    const newRefreshTokenStr = jwtUtils.generateRefreshToken(payload.sub);
    await RefreshToken.create({
      token: newRefreshTokenStr,
      userId: payload.sub,
      expiresAt: new Date(
        Date.now() + parseRefreshExpiry(refreshTokenExpiresIn)
      ),
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.cookie('refreshToken', newRefreshTokenStr, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.json({ message: "Send refresh token" });
  } catch (err) {
    return res.status(403).json({ message: "Could not refresh token", error: err.message });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await RefreshToken.findOneAndUpdate(
      { token: refreshToken },
      { revoked: true }
    );
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json({ message: "Logged out" });
  } catch (err) {
    return res.status(500).json({ message: "Logout error", error: err.message });
  }
};
