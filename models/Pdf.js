const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true }, // original name shown to users
    storedName: { type: String, required: true }, // random name actually saved on disk
    path: { type: String, required: true },
    size: { type: Number },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pdf", pdfSchema);
