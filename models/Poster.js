const mongoose = require('mongoose');

const posterSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: 'Announcement',
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true,
});

// Index to automatically disable finding expired ones via query logic
posterSchema.index({ expiresAt: 1 });

const Poster = mongoose.model('Poster', posterSchema);

module.exports = Poster;
