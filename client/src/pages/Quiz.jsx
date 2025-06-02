import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Quiz() {
  const navigate = useNavigate();
  // Mock quiz data; will fetch from backend later
  const questions = [
    {
      id: 1,
      text: 'What is the primary purpose of React?',
      options: [
        'A. Server-side rendering',
        'B. Building user interfaces',
        'C. Database management',
        'D. API development',
      ],
      correct: 'B',
    },
    {
      id: 2,
      text: 'Which of the following is a state management library for React?',
      options: ['A. Redux', 'B. Axios', 'C. Express', 'D. Mongoose'],
      correct: 'A',
    },
    {
      id: 3,
      text: 'What does JSX stand for?',
      options: [
        'A. JavaScript XML',
        'B. JavaScript Xtreme',
        'C. JavaScript Extension',
        'D. JavaScript Execution',
      ],
      correct: 'A',
    },

  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleSelect = (option) => {
    setAnswers({ ...answers, [currentQuestion]: option });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleConfirm = () => {
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="bg-gray-800 bg-opacity-80 rounded-lg p-6 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">
            Question {currentQuestion + 1} of {questions.length}
          </h2>
          <p className="text-lg text-white mb-6">{questions[currentQuestion].text}</p>
          <div className="space-y-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(option)}
                className={`w-full text-left p-3 rounded-lg ${
                  answers[currentQuestion] === option
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Confirm
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;