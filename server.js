const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // Load env vars before other imports

console.log("Loaded GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("JWT_SECRET Loaded:", !!process.env.JWT_SECRET);

const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
require('./config/passport'); // Passport config
const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');
const issueRoutes = require('./routes/issueRoutes');
const mergeRoutes = require('./routes/mergeRoutes');
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
    'https://journal-site-backend.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global Cookie Debugger
app.use((req, res, next) => {
  console.log('--- Server Global Check ---');
  console.log('Path:', req.path);
  console.log('Cookie String:', req.headers.cookie || 'No Cookies');
  next();
});

// Disable problematic middleware for debugging
app.use(compression());
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// Checkpoint 1
app.use((req, res, next) => {
  console.log('--- Checkpoint 1: After Security Middleware ---');
  next();
});

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Checkpoint 2
app.use((req, res, next) => {
  console.log('--- Checkpoint 2: After Limiter ---');
  next();
});

app.use(passport.initialize());

// Checkpoint 3
app.use((req, res, next) => {
  console.log('--- Checkpoint 3: Before User Routes ---');
  next();
});

// Debugging User Routes
console.log('DEBUG: userRoutes type:', typeof userRoutes);
if (userRoutes.stack) {
  console.log('DEBUG: userRoutes is a Router with stack length:', userRoutes.stack.length);
} else {
  console.log('DEBUG: userRoutes is NOT A ROUTER');
}

app.use('/api/users', (req, res, next) => {
  console.log('--- Pre-UserRoutes Middleware ---');
  console.log('Target Path:', req.path);
  console.log('Method:', req.method);
  next();
}, userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api', mergeRoutes);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(errorHandler);

const PORT = process.env.PORT || 5005; // Default to 5005 matching frontend
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
