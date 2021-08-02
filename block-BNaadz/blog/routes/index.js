const express = require('express');

const router = express.Router();

/* GET home page. */
// eslint-disable-next-line no-unused-vars
router.get('/', (_req, res, _next) => {
  res.render('index');
});
// eslint-disable-next-line no-unused-vars
router.get('/about', (_req, res, _next) => {
  res.render('about');
});
// eslint-disable-next-line no-unused-vars
router.get('/contact', (_req, res, _next) => {
  res.render('contact');
});

module.exports = router;
