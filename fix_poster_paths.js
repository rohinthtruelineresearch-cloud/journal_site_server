const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Poster = require('./models/Poster');

dotenv.config();

const fixPosters = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const posters = await Poster.find({});
        for (let poster of posters) {
            if (poster.imageUrl.startsWith('uploads/')) {
                poster.imageUrl = poster.imageUrl.replace('uploads/', '');
                await poster.save();
                console.log('Fixed poster:', poster._id);
            }
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixPosters();
