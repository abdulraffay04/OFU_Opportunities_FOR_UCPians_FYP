// ai.routes.js
// This file defines the API routes for AI features.
// All routes require authentication (user must be logged in).

const express = require("express");
const multer = require("multer");
const router = express.Router();
const authenticate = require("../../middleware/authenticate");
const aiController = require("./controller");

// Set up multer to store uploaded files in memory (as a buffer)
var storage = multer.memoryStorage();

// Configure multer with file size limit and file type filter
var upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max file size
  fileFilter: function (req, file, cb) {
    // Only allow PDF, DOCX, and TXT files
    var allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    // Check the file type or file extension
    var isAllowedType = allowedTypes.includes(file.mimetype);
    var hasAllowedExtension = file.originalname.match(/\.(pdf|docx|txt)$/i);

    if (isAllowedType || hasAllowedExtension) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, and TXT files are allowed"));
    }
  },
});

// POST /api/v1/ai/analyze-resume
// Upload a resume file and get AI analysis results
router.post(
  "/analyze-resume",
  authenticate,
  upload.single("file"),
  aiController.analyzeResumeController
);

// POST /api/v1/ai/chat
// Send a message to the AI chatbot
router.post(
  "/chat",
  authenticate,
  aiController.chatController
);

// GET /api/v1/ai/reports
// Get all saved resume analysis reports for the logged-in user
router.get(
  "/reports",
  authenticate,
  aiController.getReportsController
);

module.exports = router;
