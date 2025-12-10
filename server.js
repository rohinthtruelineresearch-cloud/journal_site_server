const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // Load env vars before other imports

console.log("Loaded GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
require('./config/passport'); // Passport config
const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');
const issueRoutes = require('./routes/issueRoutes');
const mergeRoutes = require('./routes/mergeRoutes');
const path = require('path');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

connectDB();

const app = express();

app.set('trust proxy', 1);
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://aurorajournal.netlify.app',
    'https://journal-site-backend.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());

// gzip/deflate compression for responses
app.use(compression());

// Security Headers
app.use(helmet());

// Data Sanitization against NoSQL injection
// app.use(mongoSanitize()); // Incompatible with Express 5

// Data Sanitization against XSS
// app.use(xss()); // Incompatible with Express 5

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(passport.initialize());

app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/issues', issueRoutes); // Route for issue management
app.use('/api', mergeRoutes);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
