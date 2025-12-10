const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Article = require('./models/Article');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const fixMissingFiles = async () => {
  await connectDB();

  try {
    const articles = await Article.find();
    let fixedCount = 0;

    for (const article of articles) {
      let updated = false;

      // Check Manuscript
      if (article.manuscriptUrl) {
         // Handle paths with backslashes or forward slashes
         const cleanPath = article.manuscriptUrl.replace(/\\/g, '/');
         const filePath = path.join(__dirname, cleanPath);
         
         if (!fs.existsSync(filePath)) {
             console.log(`[Missing Manuscript] ID: ${article._id} | Path: ${cleanPath}`);
             article.manuscriptUrl = 'uploads/dummy.pdf';
             updated = true;
         }
      }

      // Check Cover Letter
      if (article.coverLetterUrl) {
         const cleanPath = article.coverLetterUrl.replace(/\\/g, '/');
         const filePath = path.join(__dirname, cleanPath);
         
         if (!fs.existsSync(filePath)) {
             console.log(`[Missing CoverLetter] ID: ${article._id} | Path: ${cleanPath}`);
             article.coverLetterUrl = 'uploads/dummy.pdf';
             updated = true;
         }
      }

      if (updated) {
          await article.save();
          fixedCount++;
      }
    }

    console.log(`\nFixed ${fixedCount} articles with missing files.`);

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

fixMissingFiles();
