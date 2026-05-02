import { Router, Request, Response } from 'express';
import { upload } from '../config/multer';
import { protect, restrictTo } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
router.post('/', upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
  }

  // Return relative path only; frontend can prepend backend origin when needed.
  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    status: 'success',
    data: {
      url: fileUrl,
      filename: req.file.filename
    }
  });
});

export default router;
