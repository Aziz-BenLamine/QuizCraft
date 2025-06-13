import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const saveAndFetchResult = async () => {
      if (!state?.answers || !state?.quizId) {
        console.error('Missing required data:', state);
        setError('Missing quiz data. Please retake the quiz.');
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view results');
          navigate('/login');
          return;
        }

        console.log('Submitting quiz results:', {
          quizId: state.quizId,
          answers: state.answers,
        });

        // Save answers to backend
        const res = await axios.post('http://localhost:5000/api/results', {
          quizId: state.quizId,
          answers: state.answers,
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('Result saved:', res.data);
        const resultId = res.data.resultId;

        // Fetch saved result
        const resultRes = await axios.get(`http://localhost:5000/api/results/${resultId}`,
          { headers: {Authorization: `Bearer ${token}`}});
        console.log('Result fetched:', resultRes.data);
        setResult(resultRes.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error handling result:', err);
        if (err.response) {
          setError(`Server error: ${err.response.data.msg || err.response.statusText}`);
        } else if (err.request) {
          setError('No response from server. Please check if the server is running.');
        } else {
          setError('Error processing results. Please try again.');
        }
        setIsLoading(false);
      }
    };

    saveAndFetchResult();
  }, [state, navigate]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Excellent work! 🎉';
    if (score >= 80) return 'Great job! 👏';
    if (score >= 70) return 'Good effort! 👍';
    if (score >= 60) return 'Not bad, keep practicing! 💪';
    return 'Keep studying and try again! 📚';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Processing your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-gray-800 bg-opacity-90 rounded-lg p-8 max-w-md text-center">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-4">Error Loading Results</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">No results available.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const correctAnswers = result.feedback.filter(item => item.correct).length;
  const totalQuestions = result.feedback.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <div className="bg-gray-800 bg-opacity-90 rounded-lg p-8 w-full max-w-4xl shadow-xl">
          {/* Score Summary */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Quiz Results</h1>
            <div className="mb-4">
              <div className={`text-6xl font-bold ${getScoreColor(result.score)} mb-2`}>
                {result.score}%
              </div>
              <p className="text-xl text-gray-300">
                {correctAnswers} out of {totalQuestions} correct
              </p>
              <p className="text-lg text-gray-400 mt-2">
                {getScoreMessage(result.score)}
              </p>
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Detailed Feedback</h2>
            {result.feedback.map((item, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-lg border-l-4 ${
                  item.correct 
                    ? 'bg-green-900 bg-opacity-30 border-green-400' 
                    : 'bg-red-900 bg-opacity-30 border-red-400'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-medium text-white pr-4">
                    Question {index + 1}
                  </h3>
                  <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    item.correct 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {item.correct ? '✓ Correct' : '✗ Incorrect'}
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {item.questionText}
                </p>
                
                {!item.correct && item.recommendation && (
                  <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                    <h4 className="text-blue-400 font-medium mb-2">💡 Study Recommendation:</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {item.recommendation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
            >
              Take Another Quiz
            </button>
            <button
              onClick={() => window.print()}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium"
            >
              Print Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;