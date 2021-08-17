const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const userSchema = new Schema({
  isAdmin: { type: Boolean, required: true, default: false },
  name: { type: String, required: true },
  email: {
    type: String, lowercase: true, required: true, unique: true,
  },
  password: { type: String, minlength: 5 },
  age: { type: Number, min: 18, max: 80 },
  phone: { type: String, minlength: 5 },
}, { timestamps: true });

// Pre save hook
// eslint-disable-next-line func-names
userSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) return next(err);
      this.password = hashed;
      return next();
    });
  } else {
    return next();
  }
});

// Verify Password
userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => cb(err, result));
};

const User = mongoose.model('User', userSchema);

module.exports = User;
