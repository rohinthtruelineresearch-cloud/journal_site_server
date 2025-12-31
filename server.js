const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // Load env vars before other imports

const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
require('./config/passport'); // Passport config
const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');
const issueRoutes = require('./routes/issueRoutes');
const mergeRoutes = require('./routes/mergeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const posterRoutes = require('./routes/posterRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorMiddleware');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const xss = require('xss-clean');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

connectDB();

const app = express();

app.set('trust proxy', 1);
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://aurorajournal.netlify.app',
    'https://jaeid.com',
    'https://www.jaeid.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(compression());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(mongoSanitize());
app.use(xss());

app.use(passport.initialize());

app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/posters', posterRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api', mergeRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(errorHandler);

const PORT = process.env.PORT || 5005; // Default to 5005 matching frontend
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
