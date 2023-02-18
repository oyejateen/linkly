const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  linkTreeName: { type: String, required: true, unique: true },
  bio: { type: String },
  socialLinks: [{
    name: String,
    url: String
  }],
  blogs: [{
    title: String,
    url: String
  }]
});

module.exports = mongoose.model('User', userSchema);
