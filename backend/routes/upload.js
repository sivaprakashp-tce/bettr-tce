const { Router } = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const { getBucket } = require('../config/db');
const mongoose = require('mongoose');

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5242880 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

router.post('/', auth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const bucket = getBucket();
  const readable = require('stream').Readable.from(req.file.buffer);

  const uploadStream = bucket.openUploadStream(req.file.originalname, {
    contentType: req.file.mimetype,
  });

  readable.pipe(uploadStream);

  uploadStream.on('finish', () => {
    res.status(201).json({
      fileId: uploadStream.id,
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
    });
  });

  uploadStream.on('error', (err) => {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'File upload failed' });
  });
});

router.get('/:id', async (req, res) => {
  const bucket = getBucket();
  const fileId = new mongoose.Types.ObjectId(req.params.id);

  try {
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.set('Content-Type', files[0].contentType);
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

module.exports = router;
