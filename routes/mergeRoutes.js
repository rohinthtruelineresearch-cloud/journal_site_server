const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');

// Use memory storage for merging
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const mammoth = require('mammoth');

// @desc    Merge Manuscript and Cover Letter
// @route   POST /api/merge-preview
// @access  Public
router.post('/merge-preview', upload.fields([{ name: 'manuscript', maxCount: 1 }, { name: 'coverLetter', maxCount: 1 }]), async (req, res) => {
  try {
    if (!req.files || !req.files.manuscript || !req.files.coverLetter) {
      return res.status(400).json({ message: 'Both Manuscript and Cover Letter are required.' });
    }

    const manuscriptFile = req.files.manuscript[0];
    const coverLetterFile = req.files.coverLetter[0];

    // Helper to get PDF pages or convert content
    const getPdfDocument = async (file) => {
        if (file.mimetype === 'application/pdf') {
            return await PDFDocument.load(file.buffer);
        } else if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // docx
            file.originalname.endsWith('.docx')
        ) {
            // Convert DOCX to text and create a simple PDF
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            const text = result.value;
            
            const doc = await PDFDocument.create();
            const page = doc.addPage();
            const { width, height } = page.getSize();
            const fontSize = 12;
            
            page.drawText(`Preview of converted Word Document (${file.originalname}):\n\n` + text.substring(0, 3000) + (text.length > 3000 ? '...\n[Preview Truncated]' : ''), {
                x: 50,
                y: height - 50,
                size: fontSize,
                maxWidth: width - 100,
            });
            return doc;
        } else {
             // Fallback for .doc or other formats
            const doc = await PDFDocument.create();
            const page = doc.addPage();
            page.drawText(`Preview not available for this file type (${file.originalname}).\nPlease download to view.`, {
                x: 50,
                y: page.getHeight() - 100,
                size: 20,
            });
            return doc;
        }
    };

    // Load documents
    const manuscriptPdf = await getPdfDocument(manuscriptFile);
    const coverLetterPdf = await getPdfDocument(coverLetterFile);

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
    res.status(500).json({ message: 'Failed to merge files. Ensure they are valid PDF or Word documents.' });
  }
});

module.exports = router;
