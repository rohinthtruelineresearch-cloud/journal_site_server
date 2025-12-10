const mongoose = require('mongoose');

const issueSchema = mongoose.Schema({
  volume: {
    type: Number,
    required: true,
  },
  issue: {
    type: Number,
    required: true,
  },
  type: {
      type: String,
      enum: ['regular', 'special'],
      default: 'regular'
  },
  title: {
    type: String,
    // Optional title, e.g., "Special Issue on AI"
  },
  description: {
      type: String,
  },
  isPublished: {
    type: Boolean,
    default: true, // Default to true since "Publish Issue" implies it goes live
  },
  publicationDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index to ensure unique volume/issue combinations
issueSchema.index({ volume: 1, issue: 1 }, { unique: true });

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
