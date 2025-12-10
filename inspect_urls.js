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

const checkLatestArticle = async () => {
  await connectDB();

  try {
      // Find the most recently created article
    const article = await Article.findOne().sort({ createdAt: -1 });
    if (article) {
        console.log(JSON.stringify(article, null, 2));
    } else {
        console.log('No articles found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

checkLatestArticle();
