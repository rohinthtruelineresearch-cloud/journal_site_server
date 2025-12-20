const mongoose = require('mongoose');

// Define author subdocument schema
const authorSchema = new mongoose.Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  email: { type: String, default: '' },
  orcid: { type: String, default: '' },
  institution: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  isCorresponding: { type: Boolean, default: false },
  order: { type: Number, default: 1 },
}, { _id: false });

const articleSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  abstract: {
    type: String,
    required: true,
  },
  paperType: {
    type: String,
    default: 'regular',
  },
  authors: [authorSchema],
  keywords: [{
    type: String,
  }],
  content: {
    type: String,
    default: '',
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
  coverLetterText: {
    type: String,
  },
  hasFunding: {
    type: Boolean,
    default: false,
  },
  funders: [{
    name: String,
    grantNumber: String,
  }],
  wasConferenceAccepted: {
    type: Boolean,
    default: false,
  },
  conferenceName: {
    type: String,
  },
  suggestedReviewers: [{
    name: String,
    email: String,
    institution: String,
  }],
  opposedReviewers: [{
    name: String,
    email: String,
    institution: String,
  }],
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
  },
  reviewers: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, default: 'under_review' },
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

