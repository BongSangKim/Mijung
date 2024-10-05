import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaBook, FaHeart, FaBars } from 'react-icons/fa';

interface MobileNavbarProps {
  onToggleTasteSuggest: () => void;
  isTasteSuggestOpen: boolean;
}

const MobileNavbar = ({
  onToggleTasteSuggest,
  isTasteSuggestOpen,
}: MobileNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isTasteSuggestOpen) {
      onToggleTasteSuggest();
    }
  };

  const isActive = (path: string) =>
    !isTasteSuggestOpen && location.pathname === path;

  const getButtonClass = (path: string) => `
    text-white flex flex-col items-center
    ${isActive(path) ? 'text-yellow-300' : ''}
  `;

  return (
    <nav
      className={`bg-blue-600 fixed bottom-0 left-0 right-0 z-50 ${isTasteSuggestOpen ? 'bg-opacity-90' : ''}`}
    >
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => handleNavigation('/ingredients')}
          className={getButtonClass('/ingredients')}
        >
          <FaSearch className="text-2xl" />
          <span className="text-xs mt-1">식재료 찾기</span>
        </button>
        <button
          onClick={() => handleNavigation('/recipes')}
          className={getButtonClass('/recipes')}
        >
          <FaBook className="text-2xl" />
          <span className="text-xs mt-1">레시피 찾기</span>
        </button>
        <button
          onClick={() => handleNavigation('/')}
          className={getButtonClass('/')}
        >
          <img src="/icons/logo.svg" alt="홈" className="h-8 w-8" />
          <span className="text-xs mt-1">홈</span>
        </button>
        <button
          onClick={() => handleNavigation('/recipes/jjim')}
          className={getButtonClass('/recipes/jjim')}
        >
          <FaHeart className="text-2xl" />
          <span className="text-xs mt-1">찜한 레시피</span>
        </button>
        <button
          onClick={onToggleTasteSuggest}
          className={`text-white flex flex-col items-center ${isTasteSuggestOpen ? 'text-yellow-300' : ''}`}
        >
          <FaBars className="text-2xl" />
          <span className="text-xs mt-1">추천</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavbar;
