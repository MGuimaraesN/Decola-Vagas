import { Router } from 'express';
import { UploadController } from '../../controllers/upload/upload.controller.js';
import { UploadMiddleware } from '../../middlewares/upload.middleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Secure Storage
const uploadDir = path.join(__dirname, '../../../private_uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });
const router = Router();
const uploadController = new UploadController();
const uploadMiddleware = new UploadMiddleware();

router.get('/validate-token', uploadController.validateToken);

// Apply middleware BEFORE upload.single to prevent unauthenticated writes
router.post(
    '/sensitive',
    uploadMiddleware.validateUploadToken,
    upload.single('file'),
    uploadController.uploadSensitive
);

export { router as uploadRoutes };
