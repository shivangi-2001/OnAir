const express = require('express');
const router = express.Router();

const { register, login, refresh, logout, profile } = require('../controller/auth');
const { loginLimiter } = require('../middleware/rate-limit');
const  {authenticate } = require("../middleware/auth");
const uploadPicture = require('../middleware/upload_picture');

router.post("/register", uploadPicture.single('profile') ,register);
router.post("/login", loginLimiter, login);

router.get("/profile", authenticate, profile);

router.post('/refresh', refresh);
router.post('/logout', logout);
module.exports = router;