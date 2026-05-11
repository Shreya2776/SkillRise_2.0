const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');

// POST /api/chatbot/message

const multer = require('multer');
const path = require('path');

// Configure multer storage for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf, .doc and .docx format allowed!'), false);
    }
  }
});

router.post('/message', (req, res, next) => {
  upload.single('resume')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ error: 'File upload error', details: err.message });
    } else if (err) {
      // An unknown error occurred when uploading (e.g. mimetype rejection).
      return res.status(400).json({ error: 'Invalid file', details: err.message });
    }
    // Everything went fine.
    next();
  });
}, chatbotController.handleMessage);

module.exports = router;
