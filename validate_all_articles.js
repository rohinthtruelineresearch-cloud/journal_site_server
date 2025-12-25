const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Article = require('./models/Article');

dotenv.config();

const validateAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const articles = await Article.find({});
        console.log(`Checking ${articles.length} articles...`);

        for (const article of articles) {
            try {
                await article.validate();
            } catch (err) {
                console.log(`Validation failed for article: "${article.title}" (ID: ${article._id})`);
                console.log(`- Error: ${err.message}`);
                
                // Detailed check of authors
                if (err.errors && err.errors.authors) {
                    console.log(`- Authors data:`, JSON.stringify(article.authors));
                }
            }
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

validateAll();
