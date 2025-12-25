const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const updateStatuses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const db = mongoose.connection.db;
        const collection = db.collection('articles');

        // Update all documents where reviewers status is 'under_review' to 'invited'
        // Using MongoDB positional operator $[] to update all elements in the array
        const result = await collection.updateMany(
            { "reviewers.status": "under_review" },
            { $set: { "reviewers.$[elem].status": "invited" } },
            { arrayFilters: [{ "elem.status": "under_review" }] }
        );

        console.log(`Successfully updated ${result.modifiedCount} articles.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateStatuses();
