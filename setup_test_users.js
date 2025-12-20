// Script to set test credentials and update author email
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const setupTestAccounts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Update Author: Change kaviyam303@gmail.com -> tonystark@ironman.com
    const authorEmail = 'kaviyam303@gmail.com';
    const newAuthorEmail = 'tonystark@ironman.com';
    const author = await User.findOne({ email: authorEmail });
    
    if (author) {
      author.email = newAuthorEmail;
      author.password = 'Password123!'; // Plain text here, Mongoose middleware will hash it
      author.name = 'Tony Stark';
      await author.save();
      console.log(`✅ Author updated: ${newAuthorEmail}`);
    } else {
      // Create if not exists for testing
      await User.create({
        name: 'Tony Stark',
        email: newAuthorEmail,
        password: 'Password123!',
        role: 'author'
      });
      console.log(`✅ Author created: ${newAuthorEmail}`);
    }

    // 2. Set Admin Password
    const adminEmail = 'admin@journal.com';
    const admin = await User.findOne({ email: adminEmail });
    if (admin) {
      admin.password = 'Password123!';
      await admin.save();
      console.log(`✅ Admin password set: ${adminEmail}`);
    }

    // 3. Set Reviewer Password
    const reviewerEmail = 'reviewer@test.com';
    const reviewer = await User.findOne({ email: reviewerEmail });
    if (reviewer) {
      reviewer.password = 'Password123!';
      await reviewer.save();
      console.log(`✅ Reviewer password set: ${reviewerEmail}`);
    }

    console.log('\n--- SETUP COMPLETE ---');
    console.log('Author: tonystark@ironman.com / Password123!');
    console.log('Admin: admin@journal.com / Password123!');
    console.log('Reviewer: reviewer@test.com / Password123!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

setupTestAccounts();
