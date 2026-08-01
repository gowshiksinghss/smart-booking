const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
        
        if (!email.endsWith('@bitsathy.ac.in')) {
          return done(null, false, { message: 'Only @bitsathy.ac.in emails are allowed' });
        }

        try {
          let user = await User.findOne({ email });

          if (user) {
            return done(null, user);
          } else {
            // Determine role by email pattern
            let role = 'student';
            if (email.includes('faculty') || email.includes('.fac') || email.startsWith('fac.')) {
              role = 'faculty';
            } else if (email.includes('staff') || email.includes('.stf') || email.startsWith('staff.')) {
              role = 'staff';
            } else if (email.startsWith('admin.')) {
              role = 'admin';
            }

            user = await User.create({
              name: profile.displayName,
              email: email,
              role: role,
              department: 'Computer Science and Engineering', // Default assignment
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
              isAuthorized: true
            });
            return done(null, user);
          }
        } catch (err) {
          console.error('Passport Google Strategy Error:', err);
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
