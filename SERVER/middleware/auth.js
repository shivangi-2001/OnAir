// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const { accessTokenSecret } = require('../config');


exports.authenticate = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: 'Missing access token' });

  jwt.verify(token, accessTokenSecret, (err, payload) => {
    if (err) return res.status(401).json({ message: 'Access token expired or invalid' });
    req.user = payload;
    next();
  });
};

