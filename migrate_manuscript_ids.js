const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Article = require('./models/Article');

dotenv.config();

const migrateManuscriptIds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const articles = await Article.find({ manuscriptId: { $exists: false } }).sort({ createdAt: 1 });
        console.log(`Found ${articles.length} articles without Manuscript ID.`);

        let count = 0;
        for (const article of articles) {
            // Saving will trigger the pre-save hook to generate the ID
            await article.save();
            console.log(`Assigned ID to: ${article.title} -> ${article.manuscriptId}`);
            count++;
        }

        console.log(`Successfully updated ${count} articles.`);
        process.exit();
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrateManuscriptIds();
