import { Router } from 'express';
import multer from 'multer';
import { codeReview, resumeOptimize, contentGenerate, summarize, sqlGenerate } from '../controllers/toolController.js';
import { studioGenerate } from '../controllers/contentStudioController.js';
import protect from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Multer config for file uploads (memory storage, 10MB max)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      // Documents
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      // Images
      'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
      // Audio
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm', 'audio/flac', 'audio/x-m4a',
      // Video
      'video/mp4', 'video/webm', 'video/quicktime',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'));
    }
  }
});

router.use(protect);
router.use(aiLimiter);

router.post('/code-review', codeReview);
router.post('/resume-optimize', upload.single('resume'), resumeOptimize);
router.post('/content-generate', contentGenerate);
router.post('/summarize', upload.single('file'), summarize);
router.post('/sql-generate', sqlGenerate);
router.post('/content-studio', upload.single('file'), studioGenerate);

export default router;
