import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Navbar from '../components/Navbar';

function Home() {
  const onDrop = useCallback((acceptedFiles) => {
    // Handle PDF upload (will connect to backend later)
    console.log('Files dropped:', acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
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
      </div>
    </div>
  );
}

export default Home;