const mongoose = require('mongoose');

const linkTreeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: false,
  },
  backgroundColor: {
    type: String,
  },
  backgroundImage: {
    type: String,
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
    },
  ],
}, { timestamps: true });

const LinkTree = mongoose.model('LinkTree', linkTreeSchema);

module.exports = LinkTree;
