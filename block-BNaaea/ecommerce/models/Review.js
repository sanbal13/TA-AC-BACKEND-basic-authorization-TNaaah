const mongoose = require('mongoose');

const { Schema } = mongoose;

const reviewSchema = new Schema({
  content: { type: String, required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
