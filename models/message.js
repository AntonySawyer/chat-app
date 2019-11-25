const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  message: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
  },
  datetime: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

module.exports = mongoose.model('messages', MessageSchema);
