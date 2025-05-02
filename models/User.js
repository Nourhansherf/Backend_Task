const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3 },
  email:    { type: String, required: true, unique: true, match: /.+@.+\..+/ },
  password: { type: String, required: true, minlength: 8 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
