import { Router } from 'express';
import multer from 'multer';
import { pdfController } from '../controllers/pdfController';

const router = Router();

// Multer 설정 (메모리 스토리지)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB 제한
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// PDF 파싱
router.post('/parse', upload.single('pdf'), pdfController.parsePdf);

export default router;
