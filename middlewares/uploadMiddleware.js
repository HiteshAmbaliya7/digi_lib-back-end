const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const os = require("os");

const uploadDir = process.env.VERCEL ? os.tmpdir() : path.join(__dirname, "..", "uploads");
if (!process.env.VERCEL && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Never trust the client's filename on disk — random name avoids
    // path traversal / overwrite issues. The original name is kept in Mongo
    // (Pdf.filename) purely for display.
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${randomName}.pdf`);
  },
});

function fileFilter(req, file, cb) {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed."));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

module.exports = upload;
