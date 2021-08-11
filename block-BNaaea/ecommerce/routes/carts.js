const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();

/* GET home page. */
// eslint-disable-next-line no-unused-vars
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  req.body.productId = id;
  req.body.userId = req.user.id;
  req.session.productCount += 1;
  res.locals.productCount = req.session.productCount;
  console.log(req.session.productCount, 'session');
  console.log(res.locals.productCount, 'locals');
  Cart.create(req.body, (err, cart) => {
    if (err) return next(err);
    // eslint-disable-next-line no-shadow
    Product.findById(id, (err, product) => {
      if (err) return next(err);
      res.redirect(`/products/${product.slug}`);
    });
  });
});

router.get('/', (req, res, next) => {
  const userId = req.user.id;
  Cart.find({ userId })
    .populate('productId')
    .exec((err, cart) => {
      if (err) return next(err);
      res.render('cart', { cart });
    });
});

module.exports = router;
