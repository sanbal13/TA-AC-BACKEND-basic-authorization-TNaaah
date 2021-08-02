/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
const { CLIEngine } = require('eslint');
const express = require('express');

const router = express.Router();
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const auth = require('../middlewares/auth');

/* Check whether a user is logged in or not */
router.use(auth.loggedInUser);

// Edit the comment
router.get('/:id/edit', (req, res, next) => {
  const { id } = req.params;
  Comment.findById(id, (err, comment) => {
    if (err) return next(err);
    if (String(comment.author) !== req.user.id) {
      return res.send('You are not authorized');
    }
    res.render('editComment', { comment });
  });
});

router.post('/:id', (req, res, next) => {
  const { id } = req.params;
  Comment.findByIdAndUpdate(id, req.body, (err, comment) => {
    if (err) return next(err);
    Article.findById(comment.articleId, (err, article) => {
      if (err) return next(err);
      res.redirect(`/articles/${article.slug}`);
    });
  });
});

// delete the comment
router.get('/:id/delete', (req, res, next) => {
  const { id } = req.params;
  Comment.findById(id, (err, article) => {
    if (err) return next(err);
    if (String(article.author) !== req.user.id) {
      return res.send('You are not authorized');
    }
    Comment.findByIdAndDelete(id, (err, comment) => {
      if (err) return next(err);
      // eslint-disable-next-line max-len
      Article.findByIdAndUpdate(comment.articleId, { $pull: { comments: comment.id } }, (err, article) => {
        if (err) return next(err);
        res.redirect(`/articles/${article.slug}`);
      });
    });
  });
});

// likes and dislikes
router.get('/:id/like', (req, res, next) => {
  const { id } = req.params;
  Comment.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, comment) => {
    if (err) return next(err);
    Article.findById(comment.articleId, (err, article) => {
      if (err) return next(err);
      res.redirect(`/articles/${article.slug}`);
    });
  });
});

router.get('/:id/dislike', (req, res, next) => {
  const { id } = req.params;
  Comment.findByIdAndUpdate(id, { $inc: { likes: -1 } }, (err, comment) => {
    if (err) return next(err);
    Article.findById(comment.articleId, (err, article) => {
      if (err) return next(err);
      res.redirect(`/articles/${article.slug}`);
    });
  });
});

module.exports = router;
