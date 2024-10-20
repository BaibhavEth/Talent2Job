import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  userType: { type: String, enum: ['jobseeker', 'employer'] },
  resume: String, // For jobseekers
  companyName: String // For employers
});

const User = mongoose.model('User', userSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  company: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Job = mongoose.model('Job', jobSchema);

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};

// Register route
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, userType, companyName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { name, email, password: hashedPassword, userType };
    if (userType === 'employer') {
      userData.companyName = companyName;
    }
    const user = new User(userData);
    await user.save();
    req.session.userId = user._id;
    res.json({ message: 'Registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    const user = await User.findOne({ email, userType });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    req.session.userId = user._id;
    res.json({ message: 'Logged in successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Logout route
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      res.status(500).json({ error: 'Could not log out' });
    } else {
      res.json({ message: 'Logged out successfully' });
    }
  });
});

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name');
    res.json(jobs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create a job posting (for employers)
app.post('/api/employer/create-job', isAuthenticated, async (req, res) => {
  try {
    const { title, description } = req.body;
    const job = new Job({
      title,
      description,
      postedBy: req.session.userId
    });
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get employer's job postings
app.get('/api/employer/job-postings', isAuthenticated, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.session.userId });
    res.json(jobs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upload resume (for jobseekers)
app.post('/api/jobseeker/upload-resume', isAuthenticated, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const resumeUrl = `/uploads/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.session.userId, 
      { resume: resumeUrl },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Resume uploaded successfully', resumeUrl });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new route to get user profile
app.get('/api/user/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const PORT = process.env.PORT || 5001;  // Change 5000 to 5001 or any other available port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
