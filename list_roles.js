// Script to list users by role for documentation
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const listAllRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const roles = ['admin', 'reviewer', 'author'];
    
    for (const role of roles) {
      const users = await User.find({ role }).select('name email role');
      console.log(`--- ${role.toUpperCase()} USERS ---`);
      if (users.length === 0) {
        console.log('No users found for this role.');
      } else {
        users.forEach((u, i) => {
          console.log(`${i + 1}. Email: ${u.email} | Name: ${u.name}`);
        });
      }
      console.log('');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

listAllRoles();
