import Navbar from '../components/Navbar';

function Results() {
  // Mock results; will fetch from backend later
  const score = 80;
  const feedback = [
    { question: 'What is the primary purpose of React?', correct: true },
    { question: 'What is useState?', correct: false, recommendation: 'Review React hooks, especially useState.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="bg-gray-800 bg-opacity-80 rounded-lg p-6 w-full max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Quiz Results</h2>
          <p className="text-xl text-white mb-6">Your Score: {score}%</p>
          <div className="space-y-4">
            {feedback.map((item, index) => (
              <div key={index} className="p-4 bg-gray-700 rounded-lg">
                <p className="text-white">{item.question}</p>
                <p className={item.correct ? 'text-green-400' : 'text-red-400'}>
                  {item.correct ? 'Correct' : 'Incorrect'}
                </p>
                {!item.correct && (
                  <p className="text-gray-300 mt-2">{item.recommendation}</p>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Results;