const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, res, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jps',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/mkv'
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only images and videos are allowed"));
  }
  else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  },

  fileFilter,
});

module.exports = upload;