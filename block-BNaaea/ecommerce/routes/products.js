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
  Product.find({}, (err, products) => {
    if (err) return next(err);
    res.render('products', { products });
  });
});
router.get('/new', auth.loggedInUser, (req, res) => {
  if (req.user.isAdmin) {
    res.render('productForm');
  } else {
    res.send('You are not authorised to access this page');
  }
});
// Get detail about a product
router.get('/:slug', (req, res, next) => {
  const { slug } = req.params;
  Product.findOne({ slug })
    .populate({
      path: 'reviews',
      populate: {
        path: 'userId',
      },
    })
    .exec((err, product) => {
      if (err) return next(err);
      res.render('productDetail', { product });
    });
});

/* Check whether a user is logged in or not */
router.use(auth.loggedInUser);

/* Create a new Product */
router.post('/', upload.single('image'), (req, res, next) => {
  req.body.image = {
    data: fs.readFileSync(path.join(`${__dirname}/../uploads/${req.file.filename}`)),
    contentType: 'image/png',
  };
  Product.create(req.body, (err, product) => {
    if (err) return next(err);
    res.redirect('products');
  });
});

// Edit the Product
router.get('/:id/edit', (req, res, next) => {
  const { id } = req.params;
  Product.findById(id, (err, product) => {
    if (err) return next(err);
    // eslint-disable-next-line no-param-reassign    
    res.render('editProduct', { product });
  });
});

router.post('/:id', (req, res, next) => {
  const { id } = req.params;
  Product.findByIdAndUpdate(id, req.body, (err, product) => {
    if (err) return next(err);
    res.redirect(`/products/${id}`);
  });
});

// delete the product
router.get('/:id/delete', (req, res, next) => {
  const { id } = req.params;
  // check whether current logged in user matches witho the author of the product
  Product.findById(id, (err, product) => {
    if (err) return next(err);
    if (req.user.id === String(product.author)) {
      Product.findByIdAndDelete(id, (err, product) => {
        if (err) return next(err);
        Review.deleteMany({ productId: id }, (err, deletedReviews) => {
          if (err) return next(err);
          return res.redirect('/products');
        });
      });
    } else {
      return res.redirect('/products');
    }
  });
});

// like and dislike
router.get('/:id/like', (req, res, next) => {
  const { id } = req.params;
  Product.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, product) => {
    if (err) return next(err);
    res.redirect(`/products/${product.slug}`);
  });
});

router.get('/:id/dislike', (req, res, next) => {
  const { id } = req.params;
  Product.findByIdAndUpdate(id, { $inc: { likes: -1 } }, (err, product) => {
    if (err) return next(err);
    res.redirect(`/products/${product.slug}`);
  });
});

// handle reviews
router.post('/:id/review', (req, res, next) => {
  const { id } = req.params;
  req.body.productId = id;
  req.body.userId = req.user.id;
  Review.create(req.body, (err, review) => {
    if (err) return next(err);
    Product.findByIdAndUpdate(
      id,
      { $push: { reviews: review.id } },
      (err, product) => {
        if (err) return next(err);
        res.redirect(`/products/${product.slug}`);
      },
    );
  });
});

router.get('/all', (req, res, next) => {
  req.flash('option', 'all-products');
  console.log("Inside products");
  res.redirect('/users/dashboard');
});
module.exports = router;
