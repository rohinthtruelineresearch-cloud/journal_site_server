const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Article = require('./models/Article');

dotenv.config();

const debugInvitation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const user = await User.findOne({ name: 'Test Reviewer' });
        if (!user) {
            console.log('User "Test Reviewer" not found');
            process.exit();
        }
        console.log('Test Reviewer ID:', user._id.toString());

        const article = await Article.findOne({ title: /ARNOLD NETWORKS/i });
        if (!article) {
            console.log('Article "ARNOLD NETWORKS" not found');
            process.exit();
        }
        console.log('Article ID:', article._id.toString());
        console.log('Reviewers in this article:');
        article.reviewers.forEach((r, i) => {
            console.log(`[${i}] user: ${r.user ? r.user.toString() : 'null'}, status: ${r.status}`);
        });

        const match = article.reviewers.find(r => r.user && r.user.toString() === user._id.toString());
        console.log('Match found in Article model:', !!match);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugInvitation();
