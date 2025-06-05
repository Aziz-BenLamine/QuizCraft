const mongoose = require('mongoose');
const { type } = require('os');
const { title } = require('process');

const quizSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    title: { type: String, required: true },
    questions: [
        {
            text: { type: String, required: true },
            options: [{ type: String, required: true }],
            correct: {type: String, required: true},
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', quizSchema);