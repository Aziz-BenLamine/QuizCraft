const express = require('express');
   const pdfParse = require('pdf-parse');
   const router = express.Router();
   const Quiz = require('../models/Quiz');
    const mongoose = require('mongoose');

   // Simple keyword extraction and question generation
   const generateQuestions = (text) => {
     // Split text into sentences and pick random ones as "keywords"
     const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 10);
     const questions = [];
     const optionsPool = [
       'A placeholder definition',
       'Another option',
       'A correct answer',
       'Something else',
     ];

     for (let i = 0; i < Math.min(5, sentences.length); i++) {
       const sentence = sentences[i].trim();
       const questionText = `What is the main idea of: "${sentence.slice(0, 50)}..."?`;
       const options = [
         optionsPool[2], // Correct (placeholder)
         optionsPool[0],
         optionsPool[1],
         optionsPool[3],
       ].sort(() => Math.random() - 0.5); // Shuffle options
       questions.push({
         text: questionText,
         options,
         correct: optionsPool[2], // Mock correct answer
       });
     }

     return questions;
   };

   router.post('/generate', async (req, res) => {
    const { prompt, userId } = req.body; // userId will come from auth later
    const dummyUserId = '64c2e89d68c9a428e8f19d45';
    let text = prompt || '';
  
    // Handle PDF upload
    if (req.files && req.files.pdf) {
      console.log('PDF file received:', req.files.pdf.name);
      try {
        const pdfBuffer = req.files.pdf.data;
        const pdfData = await pdfParse(pdfBuffer);
        console.log('Parsed PDF data:', pdfData);
        if (!pdfData.text) {
          console.error('PDF parsing returned empty text');
          return res.status(400).json({ msg: 'PDF parsing failed or returned empty text' });
        }
        text = pdfData.text;
      } catch (err) {
        console.error('PDF Parse Error:', err);
        return res.status(500).json({ msg: 'Error processing PDF' });
      }
    }
  
    if (!text) {
      return res.status(400).json({ msg: 'No text or PDF provided' });
    }
  
    // Generate questions
    const questions = generateQuestions(text);
    console.log('Generated questions:', questions);
  
    // Save quiz to MongoDB
    try {
      const quiz = new Quiz({
        userId: new mongoose.Types.ObjectId(dummyUserId),
        title: 'Auto-generated Quiz',
        questions,
      });
      await quiz.save();
      return res.status(201).json({ msg: 'Quiz generated successfully', quiz });
    } catch (err) {
      console.error('Error saving quiz to MongoDB:', err);
      return res.status(500).json({ msg: 'Error saving quiz to database' });
    }
  });

   // Get quiz by ID
   router.get('/:id', async (req, res) => {
     try {
       const quiz = await Quiz.findById(req.params.id);
       if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
       res.json(quiz);
     } catch (err) {
       res.status(500).json({ msg: 'Server error' });
     }
   });

   module.exports = router;