const mongoose = require('mongoose');

const linktreeSchema = new mongoose.Schema({
  layout: {
    type: String,
    required: false,
  },
  profilePicture: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  pronounce: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
  },
  linkTreeName: {
    type: String,
    required: false,
  },
  header: {
    type: String,
    required: false,
  },
  links: [
    {
      title: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
      image: {
    type: String,
    required: false,
  },
    },
  ],
  blogs: [
    {
      title: {
        type: String,
        required: false,
      },
      content: {
        type: String,
        required: false,
      },
      image: {
    type: String,
    required: false,
  },
    },
  ],
});

const Linktree = mongoose.model('Linktree', linktreeSchema);

module.exports = Linktree;
