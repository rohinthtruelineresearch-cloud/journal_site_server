const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('PDFs only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @desc    Upload PDF
// @route   POST /api/articles/upload
// @access  Private/Admin
router.post('/upload', protect, admin, upload.single('pdf'), (req, res) => {
  res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

// @desc    Get next article number for a specific volume/issue
// @route   GET /api/articles/next-number
// @access  Private/Admin
router.get('/next-number', protect, admin, async (req, res) => {
    try {
        const { query } = req;
        // Construct the issue string to match how we save it, e.g. "Vol 1, Issue 2"
        // The frontend sends volume=1, issue=2
        let issueString = `Vol ${query.volume}, Issue ${query.issue}`;
        
        if (query.title) {
            issueString = query.title;
        }
        
        // Count articles with this issue string
        const count = await Article.countDocuments({ issue: issueString });
        const nextNumber = count + 1;
        
        res.json({ nextArticleNumber: nextNumber });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get logged in user's articles
// @route   GET /api/articles/my-articles
// @access  Private
router.get('/my-articles', protect, async (req, res) => {
  try {
    const articles = await Article.find({ submittedBy: req.user._id });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get articles assigned to logged in reviewer
// @route   GET /api/articles/assigned
// @access  Private (Reviewer)
router.get('/assigned', protect, async (req, res) => {
    try {
        const articles = await Article.find({ 'reviewers.user': req.user._id });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get dashboard stats
// @route   GET /api/articles/stats
// @access  Private (Admin)
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const total = await Article.countDocuments({});
        const pending = await Article.countDocuments({ status: { $in: ['submitted', 'under_review'] } });
        const published = await Article.countDocuments({ status: 'published' });
        const rejected = await Article.countDocuments({ status: 'rejected' });
        
        res.json({ total, pending, published, rejected });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({});
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single article
// @route   GET /api/articles/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ message: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// @desc    Create a new article
// @route   POST /api/articles
// @access  Private
router.post('/', protect, upload.fields([{ name: 'manuscript', maxCount: 1 }, { name: 'coverLetter', maxCount: 1 }]), async (req, res) => {
  const { title, abstract, authors, content, wantsReviewerRole } = req.body;

  try {
    //Upgrade user to reviewer if requested
    if (wantsReviewerRole === 'true' && req.user.role === 'author') {
        req.user.role = 'reviewer';
        await req.user.save();
    }

    const article = await Article.create({
      title,
      abstract,
      authors: JSON.parse(authors), // Authors sent as JSON string
      content,
      submittedBy: req.user._id,
      manuscriptUrl: req.files['manuscript'] ? req.files['manuscript'][0].path.replace(/\\/g, '/') : null,
      coverLetterUrl: req.files['coverLetter'] ? req.files['coverLetter'][0].path.replace(/\\/g, '/') : null,
    });
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update article status and comments
// @route   PUT /api/articles/:id
// @access  Private/Admin (or Reviewer for status/comments)
router.put('/:id', protect, async (req, res) => {
  const { status, reviewerComments } = req.body;

  try {
    const article = await Article.findById(req.params.id);

    if (article) {
      // Check permission: Admin or Assigned Reviewer
      const isAdmin = req.user.role === 'admin';
      
      // Check if user is one of the reviewers
      const reviewerEntry = article.reviewers.find(r => r.user.toString() === req.user._id.toString());
      const isReviewer = !!reviewerEntry;

      if (!isAdmin && !isReviewer) {
          return res.status(401).json({ message: 'Not authorized' });
      }

      if (isAdmin) {
          // Admin can update global status
           if (status) article.status = status;
           // Admin can also update general comments if needed, but usually specific reviewer comments are separate
      } else if (isReviewer) {
          // Reviewer updates THEIR specific entry
          if (status) reviewerEntry.status = status;
          if (reviewerComments) reviewerEntry.comments = reviewerComments;
          reviewerEntry.date = Date.now();
      }
      
      const updatedArticle = await article.save();
      res.json(updatedArticle);
    } else {
      res.status(404).json({ message: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Assign reviewer
// @route   PUT /api/articles/:id/assign
// @access  Private/Admin
router.put('/:id/assign', protect, admin, async (req, res) => {
    const { reviewerId } = req.body;
    try {
        const article = await Article.findById(req.params.id);

        if (article) {
            // Initialize array if undefined (backward compatibility)
            if (!article.reviewers) article.reviewers = [];

            // Check if already assigned
            const alreadyAssigned = article.reviewers.find(r => r.user.toString() === reviewerId);
            if (alreadyAssigned) {
                 return res.status(400).json({ message: 'Reviewer already assigned' });
            }
            
            // Limit directly to 5
            if (article.reviewers.length >= 5) {
                return res.status(400).json({ message: 'Maximum 5 reviewers allowed' });
            }

            article.reviewers.push({ user: reviewerId, status: 'under_review' });
            article.status = 'under_review'; // Ensure article is marked as under review
            
            const updatedArticle = await article.save();
            res.json(updatedArticle);
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update article DOI
// @route   PUT /api/articles/:id/doi
// @access  Private/Admin
router.put('/:id/doi', protect, admin, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (article) {
      article.doi = `10.1000/${article._id}`; // Simple DOI generation logic
      const updatedArticle = await article.save();
      res.json(updatedArticle);
    } else {
      res.status(404).json({ message: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update article Issue
// @route   PUT /api/articles/:id/issue
// @access  Private/Admin
router.put('/:id/issue', protect, admin, async (req, res) => {
  const { issue, articleNumber } = req.body;
  try {
    const article = await Article.findById(req.params.id);

    if (article) {
      article.issue = issue;
      article.status = 'published'; // Auto-publish
      if (articleNumber) {
          article.articleNumber = articleNumber;
      }
      const updatedArticle = await article.save();
      res.json(updatedArticle);
    } else {
      res.status(404).json({ message: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// @desc    Update article PDF URL
// @route   PUT /api/articles/:id/pdf
// @access  Private/Admin
router.put('/:id/pdf', protect, admin, async (req, res) => {
  const { pdfUrl } = req.body;
  try {
    const article = await Article.findById(req.params.id);

    if (article) {
      article.pdfUrl = pdfUrl;
      const updatedArticle = await article.save();
      res.json(updatedArticle);
    } else {
      res.status(404).json({ message: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
