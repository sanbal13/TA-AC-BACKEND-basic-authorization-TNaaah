const mongoose = require('mongoose');

const { Schema } = mongoose;

const commentSchema = new Schema({
  content: { type: String, required: true },
  articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
