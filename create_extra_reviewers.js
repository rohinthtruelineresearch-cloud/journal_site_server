const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const createReviewers = async () => {
  await connectDB();

  const users = [
    {
      name: 'Test Reviewer 2',
      email: 'reviewer2@test.com',
      password: '123456',
      role: 'reviewer',
    },
    {
      name: 'Test Reviewer 3',
      email: 'reviewer3@test.com',
      password: '123456',
      role: 'reviewer',
    },
  ];

  try {
    for (const user of users) {
      const userExists = await User.findOne({ email: user.email });

      if (userExists) {
        console.log(`User ${user.email} already exists`);
      } else {
        await User.create(user);
        console.log(`User ${user.email} created`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

createReviewers();
