const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Notification = require('../models/Notification');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const { articleStorage } = require('../config/cloudinary');

const upload = multer({
  storage: articleStorage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

function checkFileType(file, cb) {
  const filetypes = /pdf|doc|docx/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mimetype
  const allowedMimes = [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/octet-stream', // sometimes sent by browsers
      'application/zip', // docx is invalidly detected as zip sometimes
      'application/x-zip-compressed'
  ];
  const mimetype = allowedMimes.includes(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    console.log('File upload rejected. Mime:', file.mimetype, 'Ext:', path.extname(file.originalname));
    cb('Error: Information files only (PDF, DOC, DOCX)!');
  }
}



// @desc    Upload PDF
// @route   POST /api/articles/upload
// @access  Private/Admin
router.post('/upload', protect, admin, upload.single('pdf'), (req, res) => {
  res.send(req.file.path);
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
        res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
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
        res.status(500).json({ success: false, message: error.message });
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
        res.status(500).json({ success: false, message: error.message });
    }
});

const Redis = require('ioredis');
let redisClient;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
}

// Helper to get from cache or db - Removed
// const getOrSetCache = async (key, cb) => { ... }

// ... (other imports stay same, assume file continues) ...

// @desc    Get all articles with pagination
// @route   GET /api/articles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({}).sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      res.status(404).json({ success: false, message: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



// Helper to clear cache
// Helper to clear cache - Removed
// const clearCache = async (key) => { ... }

// @desc    Create a new article
// @route   POST /api/articles
// @access  Private
router.post('/', protect, upload.fields([{ name: 'manuscript', maxCount: 1 }, { name: 'coverLetter', maxCount: 1 }]), async (req, res) => {
  const { 
    title, 
    abstract, 
    authors, 
    content,
    paperType,
    keywords,
    suggestedReviewers,
    opposedReviewers,
    hasFunding,
    funders,
    wasConferenceAccepted,
    conferenceName,
    wantsReviewerRole 
  } = req.body;

  try {
    // Upgrade user to reviewer if requested
    if (wantsReviewerRole === 'true' && req.user.role === 'author') {
        req.user.role = 'reviewer';
        await req.user.save();
    }

    // Parse JSON strings safely
    const parseJSON = (str) => {
      try {
        return str ? JSON.parse(str) : [];
      } catch {
        return [];
      }
    };

    const article = await Article.create({
      title,
      abstract,
      paperType: paperType || 'regular',
      authors: parseJSON(authors),
      keywords: parseJSON(keywords),
      suggestedReviewers: parseJSON(suggestedReviewers),
      opposedReviewers: parseJSON(opposedReviewers),
      hasFunding: hasFunding === 'true',
      funders: parseJSON(funders),
      wasConferenceAccepted: wasConferenceAccepted === 'true',
      conferenceName: conferenceName || '',
      content: content || '',
      submittedBy: req.user._id,
      manuscriptUrl: req.files['manuscript'] ? req.files['manuscript'][0].path : null,
      coverLetterUrl: req.files['coverLetter'] ? req.files['coverLetter'][0].path : null,
      status: 'submitted',
    });
    
    console.log('Article created:', article._id, 'by user:', req.user._id);
    res.status(201).json(article);
  } catch (error) {
    console.error('Article creation error:', error);
    res.status(400).json({ success: false, message: error.message });
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
            const alreadyAssigned = article.reviewers.find(r => r.user && r.user.toString() === reviewerId.toString());
            if (alreadyAssigned) {
                 return res.status(400).json({ success: false, message: 'Reviewer already assigned' });
            }
            
            // Limit directly to 5
            if (article.reviewers.length >= 5) {
                return res.status(400).json({ success: false, message: 'Maximum 5 reviewers allowed' });
            }

            article.reviewers.push({ user: reviewerId, status: 'invited' });
            
            const updatedArticle = await article.save();

            // Create notification for reviewer
            try {
                await Notification.create({
                    title: 'New Review Invitation',
                    message: `You have been invited to review the manuscript: "${article.title}"`,
                    type: 'important',
                    recipient: reviewerId,
                    createdBy: req.user._id,
                    link: '/reviewer'
                });
            } catch (notifError) {
                console.error('Failed to create notification:', notifError);
                // Don't fail the whole request if notification fails
            }

            res.json(updatedArticle);
        } else {
            res.status(404).json({ success: false, message: 'Article not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Accept or decline review invitation
// @route   PUT /api/articles/:id/respond-invitation
// @access  Private (Reviewer)
router.put('/:id/respond-invitation', protect, async (req, res) => {
    const { response } = req.body; // 'accepted' or 'declined'
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }

        const reviewerEntry = article.reviewers.find(r => r.user && r.user.toString() === req.user._id.toString());
        if (!reviewerEntry) {
            return res.status(401).json({ success: false, message: 'Invitation not found for your account' });
        }

        if (response === 'accepted') {
            reviewerEntry.status = 'accepted';
            article.status = 'under_review';
        } else if (response === 'declined') {
            reviewerEntry.status = 'declined';
        } else {
            return res.status(400).json({ success: false, message: 'Invalid response' });
        }

        await article.save();

        // Notify admins about the response
        try {
            await Notification.create({
                title: `Reviewer ${response.charAt(0).toUpperCase() + response.slice(1)}`,
                message: `Reviewer response for manuscript: "${article.title}". Decision: ${response}`,
                type: response === 'accepted' ? 'update' : 'warning',
                targetRoles: ['all'], // Admins check all notifications
                createdBy: req.user._id, // The reviewer who responded
                link: '/admin'
            });
        } catch (notifError) {
            console.error('Failed to create notification for admin:', notifError);
        }

        res.json({ success: true, message: `Invitation ${response}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
      const reviewerEntry = article.reviewers.find(r => r.user && r.user.toString() === req.user._id.toString());
      const isReviewer = !!reviewerEntry;

      if (!isAdmin && !isReviewer) {
          return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      if (isAdmin) {
          // Admin can update global status
           if (status) article.status = status;
      } else if (isReviewer) {
          // Reviewer updates THEIR specific entry
          // Mark reviewer as completed now that they've submitted
          reviewerEntry.status = 'completed';
          reviewerEntry.comments = reviewerComments || reviewerEntry.comments;
          reviewerEntry.decision = status; // Record their recommendation
          reviewerEntry.date = Date.now();
      }
      
      const updatedArticle = await article.save();
      res.json(updatedArticle);
    } else {
      res.status(404).json({ success: false, message: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      // await clearCache(`article_${req.params.id}`);
      res.json(updatedArticle);
    } else {
      res.status(404).json({ success: false, message: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      // await clearCache(`article_${req.params.id}`);
      res.json(updatedArticle);
    } else {
      res.status(404).json({ success: false, message: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      // await clearCache(`article_${req.params.id}`);
      res.json(updatedArticle);
    } else {
      res.status(404).json({ success: false, message: 'Article not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
