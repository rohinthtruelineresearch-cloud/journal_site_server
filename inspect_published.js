
const mongoose = require('mongoose');
const Article = require('./models/Article');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    
    // Find all published articles
    const published = await Article.find({ status: 'published' });
    console.log('--- Current Published Articles ---');
    published.forEach(a => {
        console.log(`ID: ${a._id}, Title: "${a.title}", Issue: ${a.issue}, Number: ${a.articleNumber}`);
    });
    
    console.log('\n--- All Other Articles (Candidates for Deletion) ---');
    const others = await Article.find({ status: { $ne: 'published' } });
    others.forEach(a => {
        console.log(`ID: ${a._id}, Title: "${a.title}", Status: ${a.status}`);
    });
    
    process.exit();
};

run();
