import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import MongoStore from 'connect-mongo';

dotenv.config();

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
  resume: String // For jobseekers
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
    const { name, email, password, userType } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, userType });
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
app.post('/api/jobseeker/upload-resume', isAuthenticated, async (req, res) => {
  try {
    // In a real-world scenario, you'd handle file upload here
    // For this example, we'll just update the user's resume field with a placeholder
    await User.findByIdAndUpdate(req.session.userId, { resume: 'resume_url_placeholder' });
    res.json({ message: 'Resume uploaded successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));