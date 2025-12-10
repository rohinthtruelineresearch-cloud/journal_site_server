const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Issue = require('./models/Issue');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Clear existing
        await Issue.deleteMany({});

        // Create Regular
        await Issue.create({
            volume: 1,
            issue: 1,
            title: 'Vol 1 Issue 1',
            type: 'regular',
            isPublished: true
        });

        // Create Special
        await Issue.create({
            volume: 1,
            issue: 2,
            title: 'Vol 1 Issue 2 (Special)',
            type: 'special',
            isPublished: true
        });

        console.log('Seeded Regular and Special issues.');
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seed();
