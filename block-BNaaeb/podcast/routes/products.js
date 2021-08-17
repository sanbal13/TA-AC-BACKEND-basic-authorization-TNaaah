/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
const express = require('express');
const multer = require('multer');
const fs = require('file-system');
const path = require('path');
const Product = require('../models/Product');
const Review = require('../models/Review');
const auth = require('../middlewares/auth');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();
/* List all Products */
router.get('/', (req, res, next) => {
  Product.find({}, (err, podcasts) => {
    if (err) return next(err);
    res.render('podcasts', { podcasts });
  });
});
router.get('/new', auth.loggedInUser, (req, res) => {
  if (req.user.isAdmin) {
    res.render('podcastForm');
  } else {
    res.send('You are not authorised to access this page');
  }
});
// Get detail about a podcast
router.get('/:slug', (req, res, next) => {
  const { slug } = req.params;
  Product.findOne({ slug })
    .populate({
      path: 'reviews',
      populate: {
        path: 'userId',
      },
    })
    .exec((err, podcast) => {
      if (err) return next(err);
      res.render('podcastDetail', { podcast });
    });
});

/* Check whether a user is logged in or not */
router.use(auth.loggedInUser);

/* Create a new Product */
router.post('/', upload.single('image'), (req, res, next) => {
  req.body.image = {
    data: fs.readFileSync(
      path.join(`${__dirname}/../uploads/${req.file.filename}`)
    ),
    contentType: 'image/png',
  };
  Product.create(req.body, (err, podcast) => {
    if (err) return next(err);
    res.redirect('podcasts');
  });
});

// Edit the Product
router.get('/:id/edit', (req, res, next) => {
  const { id } = req.params;
  Product.findById(id, (err, podcast) => {
    if (err) return next(err);
    // eslint-disable-next-line no-param-reassign
    res.render('editProduct', { podcast });
  });
});

router.post('/:id', (req, res, next) => {
  const { id } = req.params;
  Product.findByIdAndUpdate(id, req.body, (err, podcast) => {
    if (err) return next(err);
    res.redirect(`/podcasts/${id}`);
  });
});

// delete the podcast
router.get('/:id/delete', (req, res, next) => {
  const { id } = req.params;
  // check whether current logged in user matches witho the author of the podcast
  Product.findById(id, (err, podcast) => {
    if (err) return next(err);
    if (req.user.id === String(podcast.author)) {
      Product.findByIdAndDelete(id, (err, podcast) => {
        if (err) return next(err);
        Review.deleteMany({ podcastId: id }, (err, deletedReviews) => {
          if (err) return next(err);
          return res.redirect('/podcasts');
        });
      });
    } else {
      return res.redirect('/podcasts');
    }
  });
});

// like and dislike
router.get('/:id/like', (req, res, next) => {
  const { id } = req.params;
  Product.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, podcast) => {
    if (err) return next(err);
    res.redirect(`/podcasts/${podcast.slug}`);
  });
});

router.get('/:id/dislike', (req, res, next) => {
  const { id } = req.params;
  Product.findByIdAndUpdate(id, { $inc: { likes: -1 } }, (err, podcast) => {
    if (err) return next(err);
    res.redirect(`/podcasts/${podcast.slug}`);
  });
});

// handle reviews
router.post('/:id/review', (req, res, next) => {
  const { id } = req.params;
  req.body.podcastId = id;
  req.body.userId = req.user.id;
  Review.create(req.body, (err, review) => {
    if (err) return next(err);
    Product.findByIdAndUpdate(
      id,
      { $push: { reviews: review.id } },
      (err, podcast) => {
        if (err) return next(err);
        res.redirect(`/podcasts/${podcast.slug}`);
      }
    );
  });
});

router.get('/all', (req, res, next) => {
  req.flash('option', 'all-podcasts');
  console.log('Inside podcasts');
  res.redirect('/users/dashboard');
});
module.exports = router;
