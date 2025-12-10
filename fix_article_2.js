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

const fixArticle = async () => {
  await connectDB();

  try {
    const articleId = "692eddc3edf67ed3ebe7b085"; // The accepted article
    const article = await Article.findById(articleId);
    
    if (article) {
        article.status = 'published';
        article.issue = 'Vol 1, Issue 1';
        article.articleNumber = 2;
        await article.save();
        console.log(`Article ${articleId} updated to Published, Issue 1, #2`);
    } else {
        console.log("Article not found");
    }

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

fixArticle();
