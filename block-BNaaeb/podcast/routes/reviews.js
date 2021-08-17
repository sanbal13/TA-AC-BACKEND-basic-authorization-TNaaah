/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
const express = require('express');

const router = express.Router();
// const Product = require('../models/Product');
//  const Review = require('../models/Review');
const auth = require('../middlewares/auth');

/* Check whether a user is logged in or not */
router.use(auth.loggedInUser);

// Edit the review
router.get('/:id/edit', (req, res, next) => {
  const { id } = req.params;
  Review.findById(id, (err, review) => {
    if (err) return next(err);
    res.render('editReview', { review });
  });
});

router.post('/:id', (req, res, next) => {
  const { id } = req.params;
  Review.findByIdAndUpdate(id, req.body, (err, review) => {
    if (err) return next(err);
    Product.findById(review.podcastId, (err, podcast) => {
      if (err) return next(err);
      res.redirect(`/podcasts/${podcast.slug}`);
    });
  });
});

// delete the review
router.get('/:id/delete', (req, res, next) => {
  const { id } = req.params;
  Review.findByIdAndDelete(id, (err, review) => {
    if (err) return next(err);
    // eslint-disable-next-line max-len
    Product.findByIdAndUpdate(
      review.podcastId,
      { $pull: { reviews: review.id } },
      (err, podcast) => {
        if (err) return next(err);
        res.redirect(`/podcasts/${podcast.slug}`);
      }
    );
  });
});

// likes and dislikes
router.get('/:id/like', (req, res, next) => {
  const { id } = req.params;
  Review.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, review) => {
    if (err) return next(err);
    Product.findById(review.podcastId, (err, podcast) => {
      if (err) return next(err);
      res.redirect(`/podcasts/${podcast.slug}`);
    });
  });
});

router.get('/:id/dislike', (req, res, next) => {
  const { id } = req.params;
  Review.findByIdAndUpdate(id, { $inc: { likes: -1 } }, (err, review) => {
    if (err) return next(err);
    Product.findById(review.podcastId, (err, podcast) => {
      if (err) return next(err);
      res.redirect(`/podcasts/${podcast.slug}`);
    });
  });
});

module.exports = router;
