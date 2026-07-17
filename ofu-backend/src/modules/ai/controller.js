// ai.controller.js
// This file handles incoming HTTP requests for AI features.
// It connects the routes to the service functions.

const aiService = require("./service");
const { success, error } = require("../../utils/responseHelper");

// Handle resume upload and send it to AI for analysis
async function analyzeResumeController(req, res) {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return error(res, "Please upload a resume file", 400);
    }

    // Get the job description from the request body (optional)
    var jobDescription = req.body.jobDescription || req.body.job_description || "";

    console.log("Resume received:", req.file.originalname);
    console.log("File size:", req.file.size, "bytes");
    console.log("Job description:", jobDescription ? "Yes" : "No");

    // Send the file to the Python AI service
    var result = await aiService.analyzeResume(
      req.file.buffer,
      req.file.originalname,
      jobDescription
    );

    // Save the report to Firestore for the user's history
    try {
      await aiService.saveReport(
        req.user.uid,
        req.file.originalname,
        result
      );
    } catch (saveError) {
      // Don't fail the whole request if saving the report fails
      console.log("Warning: Could not save report:", saveError.message);
    }

    return success(res, result);
  } catch (err) {
    console.log("Analyze error:", err.message);

    // Check if the AI service is not running
    if (err.code === "ECONNREFUSED") {
      return error(
        res,
        "AI service is not running. Please start the Python AI server on port 8000.",
        503
      );
    }

    // Check if the AI service timed out
    if (err.code === "ECONNABORTED") {
      return error(
        res,
        "AI service took too long to respond. Please try again.",
        504
      );
    }

    // Return the error from the AI service if available
    var errorMessage = err.response?.data?.error || err.message;
    return error(res, errorMessage, 500);
  }
}

// Handle chatbot message requests
async function chatController(req, res) {
  try {
    var message = req.body.message;

    // Make sure the user sent a message
    if (!message || !message.trim()) {
      return error(res, "Message is required", 400);
    }

    console.log("Chat request from:", req.user.uid);
    console.log("Message:", message);

    // Get the chatbot response
    var result = await aiService.chat(message);

    // Debug: show what we're returning to the frontend
    console.log("Chat result:", JSON.stringify(result));

    // Save the conversation to Firestore for logging
    try {
      var { db } = require("../../config/firebase");
      await db.collection("chatbotLogs").add({
        userId: req.user.uid,
        message: message,
        response: result.response,
        createdAt: new Date(),
      });
    } catch (logError) {
      // Don't fail if logging fails
      console.log("Warning: Could not save chat log:", logError.message);
    }

    return success(res, result);
  } catch (err) {
    console.log("Chat error:", err.message);
    return error(res, err.message, 500);
  }
}

// Get all saved resume reports for the current user
async function getReportsController(req, res) {
  try {
    var reports = await aiService.getReports(req.user.uid);
    return success(res, reports);
  } catch (err) {
    console.log("Get reports error:", err.message);
    return error(res, err.message, 500);
  }
}

module.exports = {
  analyzeResumeController,
  chatController,
  getReportsController,
};
