const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Generate feedback using Gemini API
const generateFeedback = async (quiz, answers) => {
  const feedback = [];

  for (let index = 0; index < quiz.questions.length; index++) {
    const question = quiz.questions[index];
    const userAnswer = answers.find((ans) => ans.questionId === index)?.selectedOption;
    const isCorrect = userAnswer === question.correct;

    let recommendation = '';

    if (!isCorrect && userAnswer) {
      try {
        const prompt = `
          Given the following quiz question and the student's incorrect answer, provide a specific study recommendation to help them improve. Return the response as JSON: { "recommendation": "Study suggestion" }
          Question: ${question.text}
          Correct Answer: ${question.correct}
          Incorrect Answer: ${userAnswer}
        `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let responseText = response.text();
        
        // Clean up the response text (remove markdown formatting if present)
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        const jsonResponse = JSON.parse(responseText);
        recommendation = jsonResponse.recommendation || 'Review the relevant topic in your study materials.';
      } catch (err) {
        console.error('Gemini API feedback error:', err);
        recommendation = 'Review the relevant topic in your study materials.'; // Fallback
      }
    }

    feedback.push({
      questionText: question.text,
      correct: isCorrect,
      recommendation,
    });
  }

  return feedback;
};

// Save quiz results
router.post('/', async (req, res) => {
  const { quizId, answers, userId } = req.body;

  try {
    console.log('Received result data:', { quizId, answers: answers?.length, userId });

    if (!quizId) {
      return res.status(400).json({ msg: 'Missing quizId' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      console.log('Quiz not found with ID:', quizId);
      return res.status(404).json({ msg: 'Quiz not found' });
    }

    // Calculate score
    let correctCount = 0;
    const processedAnswers = [];
    
    // Process answers - handle both array of strings and array of objects
    quiz.questions.forEach((question, index) => {
      let userAnswer;
      
      if (Array.isArray(answers)) {
        // If answers is an array of strings (from Quiz.jsx)
        userAnswer = answers[index];
      } else {
        // If answers is an object with questionId keys
        userAnswer = answers[index];
      }
      
      processedAnswers.push({
        questionId: index,
        selectedOption: userAnswer || ''
      });
      
      if (userAnswer === question.correct) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    console.log(`Score: ${correctCount}/${quiz.questions.length} = ${score}%`);

    // Generate feedback
    const feedback = await generateFeedback(quiz, processedAnswers);

    // Handle userId validation
    let validUserId;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      validUserId = new mongoose.Types.ObjectId(userId);
    } else {
      validUserId = new mongoose.Types.ObjectId();
    }

    // Save result
    const result = new Result({
      userId: validUserId,
      quizId: new mongoose.Types.ObjectId(quizId),
      answers: processedAnswers,
      score,
      feedback,
    });
    
    await result.save();
    console.log('Result saved successfully:', result._id);

    res.json({ resultId: result._id, score, feedback });
  } catch (err) {
    console.error('Error saving result:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get result by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate('quizId');
    if (!result) {
      console.log('Result not found with ID:', req.params.id);
      return res.status(404).json({ msg: 'Result not found' });
    }
    console.log('Result fetched successfully:', req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Error fetching result:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;