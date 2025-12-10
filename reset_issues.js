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

const resetIssues = async () => {
  await connectDB();

  try {
    const result = await Article.updateMany(
      { status: 'published' },
      { 
        $set: { status: 'accepted' },
        $unset: { issue: "", articleNumber: "", doi: "" } 
      }
    );

    console.log(`Reset ${result.modifiedCount} articles from Published to Accepted.`);
    
    // Also clear any that might have an issue but not be published (just in case)
    const result2 = await Article.updateMany(
        { issue: { $exists: true, $ne: null } },
        { $unset: { issue: "", articleNumber: "" } }
    );
    console.log(`Cleared issue field from ${result2.modifiedCount} articles.`);

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

resetIssues();
