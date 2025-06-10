const express = require('express');
const pdfParse = require('pdf-parse');
const router = express.Router();
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require("dotenv");
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 10 * 1024 * 1024 }, // Increase to 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

dotenv.config();

// INIT GEMINI API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const generateQuestions = async (text) => {
  try {
    const prompt = `
      Given the following text, generate 5 multiple-choice questions with 4 options each and indicate the correct answer. Format the response as JSON:
      {
        "questions": [
          {
            "text": "Question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct": "Option A"
          }
        ]
      }
      
      Text: ${text.slice(0, 5000)}
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();
    
    // Clean up the response text (remove markdown formatting if present)
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const jsonResponse = JSON.parse(responseText);
    return jsonResponse.questions;
  } catch (err) {
    console.error('Error generating questions:', err);
    throw new Error('Error generating questions from text');
  }
};

// 1. Handle raw text input (application/json)
router.post('/generate-text', async (req, res) => {
  const { text, userId } = req.body;

  if (!text || !userId) {
    return res.status(400).json({ msg: 'Missing text or userId' });
  }

  try {
    const questions = await generateQuestions(text);
    
    // Create a valid ObjectId or use the userId as string if it's already valid
    let validUserId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      validUserId = new mongoose.Types.ObjectId(userId);
    } else {
      // Create a new ObjectId for mock users
      validUserId = new mongoose.Types.ObjectId();
    }

    const quiz = new Quiz({
      userId: validUserId,
      title: 'Auto-generated Quiz from Text',
      questions,
    });

    await quiz.save();
    res.status(201).json({ quizId: quiz._id, msg: 'Quiz generated successfully', questions });
  } catch (err) {
    console.error('Error in generate-text:', err);
    res.status(500).json({ msg: 'Error generating quiz', error: err.message });
  }
});

// 2. Handle PDF input (multipart/form-data)
router.post('/generate', upload.single('pdf'), async (req, res) => {
  console.log('File received:', req.file ? 'Yes' : 'No');
  console.log('Body:', req.body);
  
  try {
    const userId = req.body.userId;
    
    if (!req.file) {
      return res.status(400).json({ msg: 'No PDF file uploaded' });
    }
    
    if (!userId) {
      return res.status(400).json({ msg: 'Missing userId' });
    }

    console.log('Processing PDF...');
    const parsed = await pdfParse(req.file.buffer);
    const text = parsed.text.trim();
    
    if (!text || text.length < 50) {
      return res.status(400).json({ msg: 'PDF appears to be empty or too short to generate questions' });
    }
    
    console.log('Generating questions...');
    const questions = await generateQuestions(text);

    // Create a valid ObjectId or use the userId as string if it's already valid
    let validUserId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      validUserId = new mongoose.Types.ObjectId(userId);
    } else {
      // Create a new ObjectId for mock users
      validUserId = new mongoose.Types.ObjectId();
    }

    const quiz = new Quiz({
      userId: validUserId,
      title: 'Auto-generated Quiz from PDF',
      questions,
    });

    await quiz.save();
    console.log('Quiz saved successfully');
    res.status(201).json({ quizId: quiz._id, msg: 'Quiz generated successfully', questions });
  } catch (err) {
    console.error('Error in PDF processing:', err);
    res.status(500).json({ msg: 'Error processing PDF', error: err.message });
  }
});

// Get quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;