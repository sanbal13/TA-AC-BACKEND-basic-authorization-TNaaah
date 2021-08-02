const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },
    password: { type: String, required: true, minlength: 4 },
    age: { type: Number, min: 18, max: 80 },
    phone: { type: Number, minlength: 4 },
  },
  { timestamps: true },
);

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

//Get Full Name
userSchema.methods.getFullName = function () {
  return this.firstName + ' ' + this.lastName;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
