const express = require('express');
const upload = require('../middlewares/upload.middleware');
const {
  uploadImage,
  uploadVideo,
} = require('../controllers/upload.controller');

const router = express.Router();

// Image upload
router.post('/image', upload.single('file'), uploadImage);

// Video upload
router.post('/video', upload.single('file'), uploadVideo);

module.exports = router;