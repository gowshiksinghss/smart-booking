const express = require('express');
const passport = require('passport');
const { googleCallback, devLogin } = require('../controllers/authController');
const router = express.Router();

// Google OAuth Trigger
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  googleCallback
);

// Dev/Test login endpoint
router.post('/dev-login', devLogin);

module.exports = router;
