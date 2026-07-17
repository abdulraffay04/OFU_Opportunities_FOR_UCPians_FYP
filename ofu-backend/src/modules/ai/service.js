// ai.service.js
// This file handles communication with the Python Flask AI service.
// It sends resume files to the AI and gets back analysis results.

const FormData = require("form-data");
const axios = require("axios");
const { db } = require("../../config/firebase");

// Send a resume file to the Python Flask AI service for analysis.
// Returns the AI analysis results (ATS score, skills, improvements, etc.)
async function analyzeResume(fileBuffer, fileName, jobDescription) {
  // Create a form to send the file to the AI service
  var formData = new FormData();

  // Add the resume file to the form
  formData.append("resume", fileBuffer, {
    filename: fileName,
    contentType: "application/octet-stream",
  });

  // Add the job description if the user provided one
  if (jobDescription && jobDescription.trim()) {
    formData.append("job_description", jobDescription.trim());
  }

  // Get the AI service URL from environment variables
  var aiServiceURL = process.env.PYTHON_AI_SERVICE_URL || "http://localhost:8000";

  console.log("Sending resume to AI service...");
  console.log("AI service URL:", aiServiceURL);
  console.log("File name:", fileName);

  // Send the resume to the AI service and wait for results
  var response = await axios.post(
    aiServiceURL + "/analyze",
    formData,
    {
      headers: formData.getHeaders(),
      timeout: 60000, // 60 seconds because AI processing takes time
    }
  );

  console.log("AI service response received");
  return response.data;
}

// Send a message to the UCP AI Chatbot service and get a response.
// The chatbot runs on a separate Python Flask server.
async function chat(message) {
  try {
    var chatbotURL = process.env.PYTHON_CHATBOT_URL ||
      "http://localhost:8001";
    console.log("CHATBOT URL:", chatbotURL);
    console.log("Sending message:", message);

    var response = await axios.post(
      chatbotURL + "/chat",
      { message: message },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    console.log("Chatbot status:", response.status);
    console.log("Chatbot data:", JSON.stringify(response.data));

    var botResponse = response.data.response ||
      response.data.message ||
      response.data.answer ||
      JSON.stringify(response.data);

    return {
      response: botResponse,
      intent: "general",
      confidence: 1.0,
    };
  } catch (err) {
    console.log("=== CHATBOT ERROR ===");
    console.log("Error message:", err.message);
    console.log("Error code:", err.code);
    console.log("Error response status:", err.response?.status);
    console.log("Error response data:",
      JSON.stringify(err.response?.data));
    console.log("===================");

    if (err.code === "ECONNREFUSED") {
      return {
        response: "Chatbot service is not running on port 8001. " +
          "Please start the chatbot Python server.",
        intent: "error",
        confidence: 0.0,
      };
    }

    return {
      response: "Error: " + err.message,
      intent: "error",
      confidence: 0.0,
    };
  }
}

// Save analysis results to Firestore so the user can view them later
async function saveReport(userId, fileName, result) {
  var reportData = {
    userId: userId,
    fileName: fileName,
    atsScore: result.ats?.score || 0,
    atsGrade: result.ats?.grade || "",
    skills: result.resume_skills || [],
    improvements: result.improvements || [],
    matchScore: result.match?.match_score || 0,
    contactInfo: result.contact_info || {},
    fullResult: result,
    createdAt: new Date(),
  };

  var docRef = await db.collection("resumeReports").add(reportData);
  console.log("Report saved with ID:", docRef.id);
  return docRef.id;
}

// Get all saved reports for a specific user
async function getReports(userId) {
  var snapshot = await db
    .collection("resumeReports")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  var reports = [];
  snapshot.forEach(function (doc) {
    reports.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return reports;
}

module.exports = {
  analyzeResume,
  chat,
  saveReport,
  getReports,
};
