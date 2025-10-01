import { useEffect, useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

function Home() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for token in URL after Google OAuth
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Optionally, fetch user info here and store it
      navigate('/'); // Redirect to home after storing token
    }
  }, [navigate]);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) {
        alert('No file selected');
        return;
      }
      
      const file = acceptedFiles[0];
      
      // Validate file type
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file only');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('pdf', file);
      
  
      try {
        const token = localStorage.getItem('token');
        if(!token) {
          alert('You must be logged in to upload a file');
          navigate('/login');
          return;
        }
        console.log('Uploading file:', file.name, 'Size:', file.size);
        
        const res = await axios.post('http://localhost:5000/api/quizzes/generate', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        });
        
        console.log('Quiz generated successfully:', res.data);
        navigate(`/quiz/${res.data.quizId}`);
      } catch (err) {
        console.error('Error generating quiz:', err);
        if (err.response) {
          alert(`Failed to generate quiz: ${err.response.data.msg || err.response.statusText}`);
        } else if (err.request) {
          alert('No response from server. Please check if the server is running.');
        } else {
          alert('Error uploading file. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }
    
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to generate a quiz');
        navigate('/login');
        return;
      }

      const res = await axios.post('http://localhost:5000/api/quizzes/generate-text', 
        { text: prompt },
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      console.log('Quiz generated from text:', res.data);
      navigate(`/quiz/${res.data.quizId}`);
    } catch (err) {
      console.error('Error generating quiz:', err);
      if (err.response) {
        alert(`Failed to generate quiz: ${err.response.data.msg || err.response.statusText}`);
      } else {
        alert('Error generating quiz. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
          Test Your Knowledge with AI-Generated Quizzes!
        </h1>
        <p className="text-lg text-gray-300 mb-8 text-center">
          Upload a PDF or enter a topic to create a custom quiz.
        </p>
        
        {/* PDF Upload Section */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed border-gray-400 rounded-lg p-8 w-full max-w-lg text-center cursor-pointer transition-colors ${
            isDragActive ? 'bg-gray-800 border-blue-400' : 'bg-gray-900 bg-opacity-50'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-white">Drop the PDF here...</p>
          ) : (
            <>
              <p className="text-white mb-2">
                Drag and drop a PDF here, or click to select a file
              </p>
              <p className="text-gray-400 text-sm">
                Maximum file size: 10MB
              </p>
            </>
          )}
        </div>
        
        <div className="my-6 text-gray-400">OR</div>
        
        {/* Text Prompt Section */}
        <form onSubmit={handlePromptSubmit} className="w-full max-w-lg">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a topic (e.g., Python Basics, World History, Biology)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="mt-4 w-full px-4 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            {isLoading ? 'Generating Quiz...' : 'Generate Quiz from Text'}
          </button>
        </form>
        
        {isLoading && (
          <div className="mt-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white mt-2">
              {isDragActive || prompt ? 'Processing your request...' : 'Loading...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;