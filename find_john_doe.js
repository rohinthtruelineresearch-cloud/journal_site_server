const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const findJohnDoe = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const collection = db.collection('articles');

        const articlesWithJohn = await collection.find({
            $or: [
                { authors: "John Doe" },
                { "authors": { $elemMatch: { $eq: "John Doe" } } }
            ]
        }).toArray();

        console.log(`Found ${articlesWithJohn.length} articles with "John Doe" in authors.`);
        articlesWithJohn.forEach(a => console.log(`- ${a.title} (${a._id})`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findJohnDoe();
