const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Article = require('./models/Article');

dotenv.config();

const debugArticles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const articlesWithIssue = await Article.find({ issue: { $exists: true, $ne: null } });
        
        console.log(`Found ${articlesWithIssue.length} articles with 'issue' field:`);
        articlesWithIssue.forEach(a => {
            console.log(`- Title: "${a.title}", Status: ${a.status}, Issue: "${a.issue}"`);
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugArticles();
