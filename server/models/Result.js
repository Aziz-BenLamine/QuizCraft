const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [{ 
    questionId: { type: Number, required: true }, // Index of question in quiz
    selectedOption: { type: String, required: true },
  }],
  score: { type: Number, required: true }, // Percentage score
  feedback: [{
    questionText: { type: String, required: true },
    correct: { type: Boolean, required: true },
    recommendation: { type: String }, // Only for incorrect answers
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Result', resultSchema);