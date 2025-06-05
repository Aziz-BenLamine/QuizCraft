import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

function Home() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setIsLoading(true);
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('userId', 'mock-user-id'); // Replace with auth userId later

      try {
        const res = await axios.post('http://localhost:5000/api/quizzes/generate', formData);
        navigate(`/quiz/${res.data.quiz._id}`);
      } catch (err) {
        console.error('Error generating quiz:', err);
        alert('Failed to generate quiz');
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) return alert('Please enter a prompt');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/quizzes/generate', {
        prompt,
        userId: 'mock-user-id', // Replace with auth userId later
      });
      navigate(`/quiz/${res.data.quiz._id}`);
    } catch (err) {
      console.error('Error generating quiz:', err);
      alert('Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Test Your Knowledge with AI-Generated Quizzes!
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Upload a PDF or enter a topic to create a custom quiz.
        </p>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed border-gray-400 rounded-lg p-8 w-full max-w-lg text-center ${
            isDragActive ? 'bg-gray-800' : 'bg-gray-900 bg-opacity-50'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-white">Drop the PDF here...</p>
          ) : (
            <p className="text-white">
              Drag and drop a PDF here, or click to select a file
            </p>
          )}
        </div>
        <form onSubmit={handlePromptSubmit} className="mt-6 w-full max-w-lg">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a topic (e.g., Python Basics)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate Quiz from Prompt'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;