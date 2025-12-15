const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const connectDB = require('./config/db');

// const connectDB = async () => { ... } // Removed local definition
console.log("URI Check:", process.env.MONGO_URI ? "Defined" : "Undefined");

const createAdmin = async () => {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@journal.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Fallback for dev, but env var preferred

  try {
    let user = await User.findOne({ email: adminEmail });

    if (user) {
      console.log(`Admin user ${adminEmail} already exists. Updating password...`);
      user.password = adminPassword;
      user.role = 'admin'; // Ensure role is admin
      await user.save();
      console.log('Admin password updated to:', adminPassword);
    } else {
      user = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    console.log('Done');
    process.exit(0);
  }
};

createAdmin();
