const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { uploadPdf, listPdfs, downloadPdf, deletePdf } = require("../controllers/pdfController");

router.get("/", protect, listPdfs);
router.get("/:id/download", protect, downloadPdf);

router.post("/upload", protect, requireRole("admin"), upload.single("pdf"), uploadPdf);
router.delete("/:id", protect, requireRole("admin"), deletePdf);

module.exports = router;
