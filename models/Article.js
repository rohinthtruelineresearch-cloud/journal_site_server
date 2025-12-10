const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  abstract: {
    type: String,
    required: true,
  },
  authors: [{
    type: String,
    required: true,
  }],
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'accepted', 'published', 'rejected', 'revision_required'],
    default: 'submitted',
  },
  issue: {
    type: String,
  },
  pdfUrl: {
    type: String,
  },
  manuscriptUrl: {
    type: String,
  },
  coverLetterUrl: {
    type: String,
  },
  reviewerComments: {
    type: String,
  },
  doi: {
    type: String,
  },
  articleNumber: {
    type: Number,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true, // Optional for now to allow easier testing without auth
  },
  // reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Deprecated
  reviewers: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, default: 'under_review' }, // 'under_review', 'accepted', 'rejected', 'revision_required'
      comments: { type: String },
      date: { type: Date, default: Date.now }
  }],
}, {
  timestamps: true,
});

// Indexes for performance
articleSchema.index({ status: 1 });
articleSchema.index({ issue: 1 });
articleSchema.index({ submittedBy: 1 });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
