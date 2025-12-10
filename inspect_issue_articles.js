const mongoose = require('mongoose');
const Article = require('./models/Article');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // console.log('MongoDB Connected'); // Commented out to keep output clean JSON
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const inspectArticles = async () => {
  await connectDB();

  try {
    const fs = require('fs');
    const articles = await Article.find({}, 'title status issue articleNumber submissionDate');
    fs.writeFileSync('articles.json', JSON.stringify(articles, null, 2));
    console.log("Data written to articles.json");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

inspectArticles();
