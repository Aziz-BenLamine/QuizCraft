import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/quizzes/${id}`);
        console.log('Fetched quiz:', res.data);
        setQuiz(res.data);
        setQuestions(res.data.questions);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        alert('Failed to load quiz');
        navigate('/');
      }
    };
    fetchQuiz();
  }, [id, navigate]);

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
    // Convert answers object to array format
    const answersArray = [];
    for (let i = 0; i < questions.length; i++) {
      answersArray[i] = answers[i] || ''; // Use empty string if no answer selected
    }
    
    navigate('/results', { 
      state: { 
        answers: answersArray, 
        quizId: quiz._id,
        questions: questions 
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p className="text-white">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">No questions found for this quiz.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const hasAnsweredCurrent = answers.hasOwnProperty(currentQuestion);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        {/* Progress Bar */}
        <div className="w-full max-w-2xl mb-6">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-800 bg-opacity-90 rounded-lg p-6 w-full max-w-2xl shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-300 mb-2">
              Question {currentQuestion + 1}
            </h2>
            <p className="text-lg text-white leading-relaxed">
              {currentQ?.text || 'No question text'}
            </p>
          </div>
          
          <div className="space-y-3 mb-8">
            {currentQ?.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(option)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                  answers[currentQuestion] === option
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:transform hover:scale-102'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    answers[currentQuestion] === option
                      ? 'bg-white border-white'
                      : 'border-gray-400'
                  }`}></div>
                  {option}
                </div>
              </button>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500 transition-colors"
            >
              Previous
            </button>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                {Object.keys(answers).length} of {questions.length} answered
              </p>
            </div>
            
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!hasAnsweredCurrent}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={Object.keys(answers).length < questions.length}
                className="px-6 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-500 transition-colors"
              >
                Submit Quiz
              </button>
            )}
          </div>
          
          {currentQuestion === questions.length - 1 && Object.keys(answers).length < questions.length && (
            <p className="text-yellow-400 text-sm text-center mt-4">
              Please answer all questions before submitting
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Quiz;