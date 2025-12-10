const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Article = require('./models/Article');

dotenv.config();

const fixArticles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Unset only issue and articleNumber for ALL articles
        const updateResult = await Article.updateMany(
            {}, 
            { 
                $unset: { issue: 1, articleNumber: 1 } 
            }
        );
        
        console.log(`Cleared issue assignments for ${updateResult.modifiedCount} articles.`);
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixArticles();
