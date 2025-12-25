const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const findString = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const collection = db.collection('articles');

        const articles = await collection.find({}).toArray();
        articles.forEach(a => {
            const str = JSON.stringify(a);
            if (str.includes("John Doe")) {
                console.log(`Found "John Doe" in article: ${a.title || a._id}`);
                // Find which field it is in
                for (let key in a) {
                    if (JSON.stringify(a[key]).includes("John Doe")) {
                        console.log(`- Key: ${key}, Value: ${JSON.stringify(a[key])}`);
                    }
                }
            }
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findString();
