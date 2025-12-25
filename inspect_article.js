const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Article = require('./models/Article');

dotenv.config();

const inspectArticle = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const article = await Article.findOne({ title: /ARNOLD NETWORKS/i });
        if (!article) {
            console.log('Article not found');
            process.exit();
        }

        console.log('--- Article Info ---');
        console.log('ID:', article._id);
        console.log('Title:', article.title);
        console.log('Authors raw data:', JSON.stringify(article.authors, null, 2));
        console.log('Type of authors:', typeof article.authors);
        if (Array.isArray(article.authors)) {
            console.log('Array length:', article.authors.length);
            article.authors.forEach((a, i) => {
                console.log(`Author [${i}] type:`, typeof a, ' - content:', a);
            });
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspectArticle();
