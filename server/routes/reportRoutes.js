import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import protect from '../middleware/authMiddleware.js';
import { submitReport, getMyReports } from '../controllers/reportController.js';

const router = express.Router();

// Configure Multer for screenshot upload (in-memory buffer, max 10MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (PNG, JPEG, WebP, GIF) are allowed for screenshots.'), false);
    }
  }
});

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
  } catch (err) {
    // Token expired or invalid, proceed as guest
  }
  next();
};

// Routes
router.post('/', upload.single('screenshot'), optionalAuth, submitReport);
router.get('/my-reports', protect, getMyReports);

export default router;
