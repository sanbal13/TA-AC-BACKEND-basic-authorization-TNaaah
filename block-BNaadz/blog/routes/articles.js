/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
const express = require('express');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const auth = require('../middlewares/auth');

const router = express.Router();
/* List all Articles */
router.get('/', (req, res, next) => {
  Article.find({})
    .populate('author')
    .exec((err, articles) => {
      if (err) return next(err);
      res.render('articles', { articles });
    });
});
/* Render form for article */
router.get('/new', auth.loggedInUser, (req, res) => {
  res.render('articleForm');
});
/* Display Current User Articles */
router.get('/myArticles', auth.loggedInUser, (req, res) => {
  Article.find({ author: req.user.id })
    .populate('author')
    .exec((err, articles) => {
      if (err) return next(err);
      res.render('articles', { articles });
    });
});
// Get detail about an article
router.get('/:slug', (req, res, next) => {
  const { slug } = req.params;
  Article.findOne({ slug })
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
      },
    })
    .populate('author', 'firstName lastName email')
    .exec((err, article) => {
      if (err) return next(err);
      res.render('articleDetail', { article });
    });
});

/* Check whether a user is logged in or not */
router.use(auth.loggedInUser);

/* Create a new Article */
router.post('/', (req, res, next) => {
  req.body.tags = req.body.tags.trim().split(' ');
  req.body.author = req.user.id;
  Article.create(req.body, (err, article) => {
    if (err) return next(err);
    res.redirect('articles');
  });
});

// Edit the Article
router.get('/:id/edit', (req, res, next) => {
  const { id } = req.params;
  Article.findById(id, (err, article) => {
    if (err) return next(err);
    // eslint-disable-next-line no-param-reassign
    if (String(article.author) !== req.user.id) {
      return res.send('You are not authorized');
    }
    article.tags = article.tags.join(' ');
    res.render('editArticle', { article });
  });
});

router.post('/:id', (req, res, next) => {
  const { id } = req.params;
  req.body.tags = req.body.tags.trim().split(' ');
  Article.findByIdAndUpdate(id, req.body, (err, article) => {
    if (err) return next(err);
    res.redirect(`/articles/${article.slug}`);
  });
});

// delete the article
router.get('/:id/delete', (req, res, next) => {
  const { id } = req.params;
  // check whether current logged in user matches witho the author of the article
  Article.findById(id, (err, article) => {
    if (err) return next(err);
    if (String(article.author) !== req.user.id) {
      return res.send('You are not authorized');
    }
    Article.findByIdAndDelete(id, (err, article) => {
      if (err) return next(err);
      Comment.deleteMany({ articleId: id }, (err, deletedComments) => {
        if (err) return next(err);
        return res.redirect('/articles');
      });
    });
  });
});

// like and dislike
router.get('/:id/like', (req, res, next) => {
  const { id } = req.params;
  Article.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, article) => {
    if (err) return next(err);
    res.redirect(`/articles/${article.slug}`);
  });
});

router.get('/:id/dislike', (req, res, next) => {
  const { id } = req.params;
  Article.findByIdAndUpdate(id, { $inc: { likes: -1 } }, (err, article) => {
    if (err) return next(err);
    res.redirect(`/articles/${article.slug}`);
  });
});

// handle comments
router.post('/:id/comment', (req, res, next) => {
  const { id } = req.params;
  req.body.articleId = id;
  req.body.author = req.user.id;
  Comment.create(req.body, (err, comment) => {
    if (err) return next(err);
    Article.findByIdAndUpdate(
      id,
      { $push: { comments: comment.id } },
      (err, article) => {
        if (err) return next(err);
        res.redirect(`/articles/${article.slug}`);
      },
    );
  });
});

module.exports = router;
