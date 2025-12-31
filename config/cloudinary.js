const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for Articles (PDFs only)
const articleStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'journal_articles',
    resource_type: 'raw', // Important for PDFs and non-image files
    // allowed_formats: ['pdf', 'doc', 'docx'],
    public_id: (req, file) => `${file.fieldname}-${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`, // Remove extension for ID
  },
});

// Storage for Posters (Images)
const posterStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'journal_posters',
    resource_type: 'image',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    public_id: (req, file) => `poster-${Date.now()}`,
  },
});

module.exports = {
  cloudinary,
  articleStorage,
  posterStorage,
};
