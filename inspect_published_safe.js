
const mongoose = require('mongoose');
const Article = require('./models/Article');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    
    let output = '';
    
    // Find all published articles
    const published = await Article.find({ status: 'published' });
    output += '--- Current Published Articles ---\n';
    published.forEach(a => {
        output += `ID: ${a._id}, Title: "${a.title}", Issue: ${a.issue}, Number: ${a.articleNumber}\n`;
    });
    
    output += '\n--- All Other Articles (Candidates for Deletion) ---\n';
    const others = await Article.find({ status: { $ne: 'published' } });
    others.forEach(a => {
        output += `ID: ${a._id}, Title: "${a.title}", Status: ${a.status}\n`;
    });
    
    fs.writeFileSync('published_list_safe.txt', output);
    console.log('Done writing to published_list_safe.txt');
    process.exit();
};

run();
