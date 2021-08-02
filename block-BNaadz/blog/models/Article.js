const mongoose = require('mongoose');

const { Schema } = mongoose;

const articleSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  tags: [String],
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: { type: Number, default: 0 },
  slug: { type: String, unique: true },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });

articleSchema.pre('save', function (next) {  
  this.slug = this.title.toLowerCase().split(' ').join('-');
  return next();
});

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;
