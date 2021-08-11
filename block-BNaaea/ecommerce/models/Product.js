const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  price: { type: Number },
  image: { data: Buffer, contentType: String },
  slug: { type: String, unique: true },
  likes: { type: Number, default: 0 },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
}, { timestamps: true });

productSchema.pre('save', function slug(next) {
  this.slug = this.name.toLowerCase().split(' ').join('-');
  return next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
