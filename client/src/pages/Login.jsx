import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      <Navbar />
      <div className="flex flex-grow items-center justify-center px-4">
        <div className="bg-gray-800 bg-opacity-80 rounded-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Login</h2>
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Login
            </button>
          </form>
          <p className="text-gray-400 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;