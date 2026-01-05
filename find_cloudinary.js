const mongoose = require('mongoose');
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

const findCloudinaryArticles = async () => {
  await connectDB();

  try {
    const articles = await Article.find({
      $or: [
        { manuscriptUrl: /cloudinary/ },
        { coverLetterUrl: /cloudinary/ },
        { pdfUrl: /cloudinary/ }
      ]
    });

    console.log(`Found ${articles.length} articles with Cloudinary URLs:`);
    articles.forEach(a => {
      console.log(`ID: ${a._id}, Title: ${a.title}`);
      console.log(`  Manuscript: ${a.manuscriptUrl}`);
      console.log(`  Cover Letter: ${a.coverLetterUrl}`);
      console.log(`  PDF: ${a.pdfUrl}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

findCloudinaryArticles();
