import { Link } from 'react-router-dom';

function Navbar() {
  // Placeholder for now
  const isLoggedIn = false;
  const username = 'User'; 

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 bg-opacity-90 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">
          QuizCraft
        </Link>
        <div>
          {isLoggedIn ? (
            <span className="text-white">{username}</span>
          ) : (
            <Link to="/login" className="text-white hover:text-gray-300">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;