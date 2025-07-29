const passport = require("passport");
const OIDCStrategy = require("passport-azure-ad").OIDCStrategy;
require("dotenv").config();
const bcrypt = require("bcrypt");
const { User } = require("../model/user"); 

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new OIDCStrategy(
    {
      identityMetadata: process.env.MICROSOFT_IDENTITY_METADATA,
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      responseType: "code",
      responseMode: "query",
      redirectUrl: process.env.MICROSOFT_REDIRECT_URI,
      scope: ["profile", "email", "openid"],
    },
    async (iss, sub, profile, accessToken, refreshToken, done) => {
      try {
        if (!profile) {
          return done(new Error("No profile found"), null);
        }

        const email =
          profile._json?.email ||
          profile._json?.preferred_username ||
          (profile.emails && profile.emails[0]);

        if (!email) {
          return done(new Error("No email found in profile"), null);
        }

        const name = profile.displayName || profile._json?.name || "Unknown";

        const photo = (profile.photos && profile.photos[0]?.value) || null;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            name,
            password: await bcrypt.hash(Math.random().toString(36).slice(-8), 12),
            profilePicture: photo,
          });
          console.log("Created new user:", user.email);
        } else {
          console.log("Found existing user:", user.email);
        }

        return done(null, user);
      } catch (error) {
        console.error("Error in OIDCStrategy:", error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
