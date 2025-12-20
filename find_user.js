// Script to retrieve user data from MongoDB
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const findUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find user by email
    const email = 'kaviyam303@gmail.com';
    const user = await User.findOne({ email: email });

    if (user) {
      console.log('\n=== User Found ===');
      console.log('ID:', user._id);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Created At:', user.createdAt);
      console.log('Password (hashed):', user.password ? '[HASHED - not readable]' : 'No password set (Google login?)');
    } else {
      console.log('No user found with email:', email);
      
      // List all users
      console.log('\n=== All Users in Database ===');
      const allUsers = await User.find({}).select('name email role createdAt');
      allUsers.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email} | ${u.name} | Role: ${u.role}`);
      });
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
  }
};

findUser();
