const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { protect } = require('../middleware/authMiddleware');

// Test route to verify mounting
router.get('/test', (req, res) => res.send('Issue Routes Working'));

// @desc    Get next issue number for a volume
// @route   GET /api/issues/next-number/:volume
// @access  Private (Admin)
router.get('/next-number/:volume', protect, async (req, res) => {
  console.log("Next number requested for volume:", req.params.volume);
  try {
    const volume = parseInt(req.params.volume);
    
    // Find the issue with the highest number for this volume
    const lastIssue = await Issue.findOne({ volume }).sort({ issue: -1 });
    
    const nextIssueNumber = lastIssue ? lastIssue.issue + 1 : 1;
    
    res.json({ nextIssueNumber });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Publish a new issue
// @route   POST /api/issues/publish
// @access  Private (Admin)
router.post('/publish', protect, async (req, res) => {
    const { volume, issue: requestedIssue, title, description } = req.body;

    if (!volume) {
        return res.status(400).json({ success: false, message: "Volume number is required" });
    }

    try {
        let issueNumber;

        if (requestedIssue) {
            // Logic 1: Use strictly requested Issue Number
            issueNumber = requestedIssue;

            // Check if it exists
            const existingIssue = await Issue.findOne({ volume, issue: issueNumber });
            if (existingIssue) {
                return res.status(200).json(existingIssue);
            }
        } else {
            // Logic 2: Auto-increment (Fallback)
            const lastIssue = await Issue.findOne({ volume }).sort({ issue: -1 });
            issueNumber = lastIssue ? lastIssue.issue + 1 : 1;
        }

        const issue = await Issue.create({
            volume,
            issue: issueNumber,
            title: title || `Volume ${volume}, Issue ${issueNumber}`,
            description,
            type: req.body.type || 'regular'
        });

        res.status(201).json(issue);
    } catch (error) {
        if (error.code === 11000) {
             // Race condition caught
             const existing = await Issue.findOne({ volume, issue: req.body.issue }); 
             return res.status(200).json(existing);
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
});

// @desc    Get all issues
// @route   GET /api/issues
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type } = req.query;
        const query = { isPublished: true };
        
        if (type) {
            query.type = type;
        }
        
        console.log(`GET /issues - Query:`, JSON.stringify(query));

        const issues = await Issue.find(query).sort({ volume: -1, issue: -1 });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});



module.exports = router;
