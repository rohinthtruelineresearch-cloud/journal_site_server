const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Issue = require('./models/Issue');

dotenv.config();

const inspectIssues = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const issues = await Issue.find({});
        console.log('--- All Issues in DB ---');
        issues.forEach(i => {
            console.log(`- Vol ${i.volume}, Issue ${i.issue} | Type: "${i.type}" | Title: "${i.title}"`);
        });
        console.log('------------------------');

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

inspectIssues();
