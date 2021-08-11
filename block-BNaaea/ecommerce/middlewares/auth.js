const User = require('../models/User');

module.exports = {
  loggedInUser: (req, res, next) => {
    if (req.session && req.session.userId) {
      next();
    } else {
      req.session.returnsTo = req.originalUrl;
      res.redirect('/users/login');
    }
  },
  userInfo: (req, res, next) => {
    const userId = req.session && req.session.userId;
    if (userId) {
      User.findById(userId, 'isAdmin name email', (err, user) => {
        if (err) return next(err);
        req.user = user;
        res.locals.user = user;
        res.locals.productCount = res.locals.productCount || 0;
        next();
      });
    } else {
      req.user = null;
      res.locals.user = null;
      next();
    }
  },
};
