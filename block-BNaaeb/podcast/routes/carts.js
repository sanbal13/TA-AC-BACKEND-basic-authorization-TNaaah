const express = require('express');

const router = express.Router();

/* GET home page. */
// eslint-disable-next-line no-unused-vars
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  req.body.podcastId = id;
  req.body.userId = req.user.id;
  req.session.podcastCount += 1;
  res.locals.podcastCount = req.session.podcastCount;
  console.log(req.session.podcastCount, 'session');
  console.log(res.locals.podcastCount, 'locals');
  Cart.create(req.body, (err, cart) => {
    if (err) return next(err);
    // eslint-disable-next-line no-shadow
    Product.findById(id, (err, podcast) => {
      if (err) return next(err);
      res.redirect(`/podcasts/${podcast.slug}`);
    });
  });
});

router.get('/', (req, res, next) => {
  const userId = req.user.id;
  Cart.find({ userId })
    .populate('podcastId')
    .exec((err, cart) => {
      if (err) return next(err);
      res.render('cart', { cart });
    });
});

module.exports = router;
