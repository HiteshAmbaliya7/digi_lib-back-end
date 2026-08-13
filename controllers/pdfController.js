const fs = require("fs");
const Pdf = require("../models/Pdf");

exports.uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file was uploaded." });
    }

    const pdf = await Pdf.create({
      filename: req.file.originalname,
      storedName: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      message: "PDF uploaded successfully.",
      pdf: { id: pdf._id, filename: pdf.filename, uploadedAt: pdf.createdAt },
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed.", error: err.message });
  }
};

exports.listPdfs = async (req, res) => {
  try {
    const pdfs = await Pdf.find().sort({ createdAt: -1 });
    res.status(200).json({
      pdfs: pdfs.map((p) => ({
        id: p._id,
        filename: p.filename,
        uploadedAt: p.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load PDFs.", error: err.message });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf || !fs.existsSync(pdf.path)) {
      return res.status(404).json({ message: "File not found." });
    }
    // res.download sets Content-Disposition so the browser saves it with
    // the original filename, even though it's stored on disk under a random name
    res.download(pdf.path, pdf.filename);
  } catch (err) {
    res.status(500).json({ message: "Could not download this file.", error: err.message });
  }
};

exports.deletePdf = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ message: "File not found." });
    }
    if (fs.existsSync(pdf.path)) {
      fs.unlinkSync(pdf.path);
    }
    await pdf.deleteOne();
    res.status(200).json({ message: "PDF removed." });
  } catch (err) {
    res.status(500).json({ message: "Could not remove this file.", error: err.message });
  }
};
