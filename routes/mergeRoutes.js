const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');

// Use memory storage for merging
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @desc    Merge Manuscript and Cover Letter
// @route   POST /api/merge-preview
// @access  Public
router.post('/merge-preview', upload.fields([{ name: 'manuscript', maxCount: 1 }, { name: 'coverLetter', maxCount: 1 }]), async (req, res) => {
  try {
    if (!req.files || !req.files.manuscript || !req.files.coverLetter) {
      return res.status(400).json({ message: 'Both Manuscript and Cover Letter are required.' });
    }

    const manuscriptBuffer = req.files.manuscript[0].buffer;
    const coverLetterBuffer = req.files.coverLetter[0].buffer;

    // Load PDFs
    const manuscriptPdf = await PDFDocument.load(manuscriptBuffer);
    const coverLetterPdf = await PDFDocument.load(coverLetterBuffer);

    // Create new PDF
    const mergedPdf = await PDFDocument.create();

    // Copy pages from Cover Letter first
    const coverPages = await mergedPdf.copyPages(coverLetterPdf, coverLetterPdf.getPageIndices());
    coverPages.forEach((page) => mergedPdf.addPage(page));

    // Copy pages from Manuscript
    const manuscriptPages = await mergedPdf.copyPages(manuscriptPdf, manuscriptPdf.getPageIndices());
    manuscriptPages.forEach((page) => mergedPdf.addPage(page));

    // Save merged PDF
    const mergedPdfBytes = await mergedPdf.save();

    // Send response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=preview.pdf');
    res.send(Buffer.from(mergedPdfBytes));

  } catch (error) {
    console.error('Merge error:', error);
    res.status(500).json({ message: 'Failed to merge PDFs. Ensure both are valid PDF files.' });
  }
});

module.exports = router;
