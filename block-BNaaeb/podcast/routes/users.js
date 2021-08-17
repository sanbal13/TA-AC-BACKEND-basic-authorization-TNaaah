/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
const express = require('express');
const Podcast = require('../models/Podcast');
const User = require('../models/User');

const router = express.Router();

// Login
// eslint-disable-next-line no-unused-vars
router.get('/login', (req, res, _next) => {
  const error = req.flash('error')[0];
  res.render('login', { error });
});
router.post('/login', (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash('error', 'Email/Password required');
    return res.redirect('/users/login');
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error', 'Email is not registered');
      return res.redirect('/users/login');
    }
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      if (!result) {
        req.flash('error', 'Password is not correct');
        return res.redirect('/users/login');
      }
      req.session.userId = user.id;
      req.session.podcastCount = req.session.podcastCount || 0;
      res.locals.podcastCount = req.session.podcastCount;
      if (user.isAdmin) {
        res.redirect('/users/dashboard');
      } else {
        res.redirect(req.session.returnsTo || '/');
      }
      delete req.session.returnsTo;
    });
  });
});

// Register
router.get('/register', (req, res, next) => {
  const error = req.flash('error')[0];
  const emailUniqueError = req.flash('emailUniqueError')[0];
  const NaNError = req.flash('NaNError')[0];
  res.render('register', { error, emailUniqueError, NaNError });
});
router.post('/register', (req, res, next) => {
  if (req.body.admin === 'admin') {
    req.body.isAdmin = true;
  }
  if (Number.isNaN(Number(req.body.phone))) {
    req.flash('NaNError', 'Phone number must contain only numbers');
    return res.redirect('/users/register');
  }
  User.create(req.body, (err, user) => {
    if (err) {
      if (err.name === 'MongoError') {
        req.flash('emailUniqueError', 'This email is already taken');
        return res.redirect('/users/register');
      }
      if (err.name === 'ValidationError') {
        req.flash('error', err.message);
        return res.redirect('/users/register');
      }
    }
    res.redirect('/users/login');
  });
});

// Logout
router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect-sid');
  res.redirect('/users/login');
});

router.get('/all', (req, res, next) => {
  req.flash('option', 'all-users');
  res.redirect('/users/dashboard');
});

router.get('/dashboard', (req, res, next) => {
  const option = req.flash('option')[0];
  if (option === 'all-users') {
    User.find({}, (err, users) => {
      if (err) return next(err);
      return res.render('adminDashboard', { option, users });
    });
  } else if (option === 'all-podcasts') {
    console.log("Inside all podcasts");
    Podcast.find({}, (err, podcasts) => {
      if(err) return next(err);
      console.log(podcasts, 'podcasts');
      return res.render('adminDashboard', { option, podcasts });
    })
  }else {
    console.log(option);
    return res.render('adminDashboard', { option });
  }
});

module.exports = router;
