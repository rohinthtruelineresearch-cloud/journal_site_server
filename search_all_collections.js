const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const searchEverything = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const result = {};

        const collections = await db.listCollections().toArray();
        for (let colInfo of collections) {
            const collection = db.collection(colInfo.name);
            const docs = await collection.find({}).toArray();
            docs.forEach(doc => {
                const str = JSON.stringify(doc);
                if (str.includes("John Doe")) {
                    console.log(`Found "John Doe" in collection: ${colInfo.name}`);
                    console.log(`- ID: ${doc._id}`);
                    console.log(`- Content: ${str.substring(0, 500)}...`);
                }
            });
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

searchEverything();
