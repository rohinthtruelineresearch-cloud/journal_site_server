const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Define schema placeholders if models are not requiring correctly, 
// but sticking to require based on file presence.
const Article = require('./models/Article');
const Issue = require('./models/Issue');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('MONGO_URI is not defined in .env');
        process.exit(1);
    }
    console.log('Attempting to connect to:', uri.substring(0, 20) + '...');
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Error connecting to DB:', err.message);
    process.exit(1);
  }
};

const reset = async () => {
    await connectDB();
    try {
        console.log('Deleting all articles...');
        await Article.deleteMany({});
        console.log('All articles deleted.');
        
        console.log('Deleting all issues...');
        await Issue.deleteMany({});
        console.log('All issues deleted.');
        
    } catch (err) {
        console.error('Error resetting data:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed.');
        process.exit(0);
    }
};

reset();
