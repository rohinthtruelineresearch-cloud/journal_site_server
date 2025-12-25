const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const fixData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const db = mongoose.connection.db;
        const collection = db.collection('articles');

        const articles = await collection.find({}).toArray();
        let fixCount = 0;

        for (const article of articles) {
            let needsFix = false;
            let fixedAuthors = [];

            if (article.authors && Array.isArray(article.authors)) {
                fixedAuthors = article.authors.map(author => {
                    if (typeof author === 'string') {
                        needsFix = true;
                        // Split name if it's a string like "John Doe"
                        const parts = author.split(' ');
                        return {
                            firstName: parts[0] || 'Unknown',
                            lastName: parts.slice(1).join(' ') || 'Author',
                            email: '',
                            institution: '',
                            city: '',
                            country: '',
                            isCorresponding: false,
                            order: 1
                        };
                    }
                    return author;
                });
            } else if (article.authors && typeof article.authors === 'string') {
                needsFix = true;
                const parts = article.authors.split(' ');
                fixedAuthors = [{
                    firstName: parts[0] || 'Unknown',
                    lastName: parts.slice(1).join(' ') || 'Author',
                    email: '',
                    institution: '',
                    city: '',
                    country: '',
                    isCorresponding: false,
                    order: 1
                }];
            }

            if (needsFix) {
                await collection.updateOne(
                    { _id: article._id },
                    { $set: { authors: fixedAuthors } }
                );
                console.log(`Fixed authors for article: ${article.title || article._id}`);
                fixCount++;
            }
        }

        console.log(`Successfully fixed ${fixCount} articles.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixData();
