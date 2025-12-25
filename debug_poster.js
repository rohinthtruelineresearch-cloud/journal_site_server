const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Poster = require('./models/Poster');

dotenv.config();

const checkPoster = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const poster = await Poster.findOne({
            isActive: true,
            expiresAt: { $gt: new Date() }
        });
        console.log('Active Poster:', poster);
        
        const allPosters = await Poster.find({});
        console.log('All Posters in DB:', allPosters.length);
        if (allPosters.length > 0) {
            console.log('First Poster Data:', allPosters[0]);
        }
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkPoster();
