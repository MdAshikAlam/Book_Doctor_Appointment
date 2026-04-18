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
router.post('/', protect, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
  }

  // Use the port from environment or default to 5000
  const port = process.env.PORT || 5000;
  // Construct the URL. In production, this would use the domain name.
  // For now, we assume it's running on localhost
  const fileUrl = `${req.protocol}://${req.hostname}:${port}/uploads/${req.file.filename}`;

  res.status(200).json({
    status: 'success',
    data: {
      url: fileUrl,
      filename: req.file.filename
    }
  });
});

export default router;
