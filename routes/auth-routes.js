// routes/auth-routes.js
const express = require('express');
const passport = require('passport');
const ensureLogin = require('connect-ensure-login');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const authRoutes = express.Router();

// Bcrypt to encrypt passwords
const bcryptSalt = 10;

authRoutes.get('/', (req, res, next) => {
  res.render('auth/signup');
});

authRoutes.post('/signup', (req, res, next) => {
  const { username, password } = req.body;

  if (username === '' || password === '') {
    res.render('auth/signup', { message: 'Indicate username and password' });
    return;
  }

  User.findOne({ username })
    .then((user) => {
      if (user !== null) {
        res.render('auth/signup', { message: 'The username already exists' });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        password: hashPass,
      });

      newUser.save((err) => {
        if (err) {
          res.render('auth/signup', { message: 'Something went wrong' });
        } else {
          res.redirect('/');
        }
      });
    })
    .catch((error) => {
      next(error);
    });
});

authRoutes.get('/login', (req, res, next) => {
  res.render('auth/login');
});

authRoutes.post('/login', passport.authenticate('local', {
  successRedirect: '/private-page',
  failureRedirect: '/login',
  failureFlash: true,
  passReqToCallback: true,
}));

authRoutes.get('/auth/slack', passport.authenticate('slack'));
authRoutes.get('/auth/slack/callback', passport.authenticate('slack', {
  successRedirect: '/private-page',
  failureRedirect: '/',
}));

authRoutes.get('/private-page', ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render('private', { user: req.user });
});

authRoutes.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

module.exports = authRoutes;
