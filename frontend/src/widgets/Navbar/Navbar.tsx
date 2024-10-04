import { Link } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link to="/" className="flex items-center py-4 px-2">
                <img src="/icons/logo.svg" alt="로고" className="h-8 w-8" />
                <span className="font-semibold text-white text-lg ml-2">
                  미정(味定)
                </span>
              </Link>
            </div>
          </div>
          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/ingredients"
              className="py-4 px-2 text-white hover:text-blue-200 transition duration-300"
            >
              식재료 찾기
            </Link>
            <Link
              to="/recipes"
              className="py-4 px-2 text-white hover:text-blue-200 transition duration-300"
            >
              레시피 찾기
            </Link>
            <Link
              to="/recipes/jjim"
              className="py-4 px-2 text-white hover:text-blue-200 transition duration-300"
            >
              찜한 레시피
            </Link>
          </div>
          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* 모바일 메뉴 */}
      {isOpen && (
        <div className="md:hidden">
          <Link
            to="/ingredients"
            className="block py-2 px-4 text-sm text-white hover:bg-blue-700"
          >
            식재료 찾기
          </Link>
          <Link
            to="/recipes"
            className="block py-2 px-4 text-sm text-white hover:bg-blue-700"
          >
            레시피 찾기
          </Link>
          <Link
            to="/recipes/jjim"
            className="block py-2 px-4 text-sm text-white hover:bg-blue-700"
          >
            찜한 레시피
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
