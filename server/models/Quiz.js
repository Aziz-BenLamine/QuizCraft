const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true }, // e.g., "Python Basics Quiz"
  questions: [
    {
      text: { type: String, required: true }, // e.g., "What is a variable?"
      options: [{ type: String, required: true }], // e.g., ["A", "B", "C", "D"]
      correct: { type: String, required: true }, // e.g., "A"
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', quizSchema);