const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
dotenv.config();

// Initialize express app
const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));


// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
  ],
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


// Connect DB
connectDB();

// servering the uploaded picture
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.send('Welcome to onAir API 🚀');
});

// TODO: Add routes here
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const googleAuthRoutes = require('./routes/google-auth');
app.use('/api/auth', googleAuthRoutes);

const githubAuthRoutes = require("./routes/github-auth");
app.use('/api/auth', githubAuthRoutes);

const facebookAuthRoutes = require("./routes/facebook-auth");
app.use('/api/auth', facebookAuthRoutes);

const linkedinAuthRoutes = require("./routes/linkedin-auth");
app.use('/api/auth', linkedinAuthRoutes);

const xAuthRoutes = require("./routes/x-auth1.0");
app.use('/api/auth', xAuthRoutes);

const microsoftAuthRoutes = require("./routes/microsoft-auth")
app.use('/api/auth', microsoftAuthRoutes);

const meetingRoutes = require('./routes/meeting');
app.use('/api/meeting', meetingRoutes);

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Max size is 5MB." });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }

  // Catch all other errors
  return res.status(500).json({ message: "Server error", error: err.message });
});

module.exports = app;
