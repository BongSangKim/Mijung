import { useNavigate, useLocation } from 'react-router-dom';
import { FaCarrot, FaUtensils, FaHeart, FaMagic, FaHome } from 'react-icons/fa';

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
    flex flex-col items-center
    ${isActive(path) ? 'text-coral' : 'text-text-light'}
  `;

  return (
    <nav
      className={`bg-background-light border-t border-peach fixed bottom-0 left-0 right-0 z-50 ${
        isTasteSuggestOpen ? 'bg-opacity-90' : ''
      }`}
    >
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => handleNavigation('/ingredients')}
          className={getButtonClass('/ingredients')}
        >
          <FaCarrot className="text-2xl" />
          <span className="text-xs mt-1">식재료</span>
        </button>
        <button
          onClick={() => handleNavigation('/recipes')}
          className={getButtonClass('/recipes')}
        >
          <FaUtensils className="text-2xl" />
          <span className="text-xs mt-1">레시피</span>
        </button>
        <button
          onClick={() => handleNavigation('/')}
          className={getButtonClass('/')}
        >
          <FaHome className="text-2xl" />
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
          className={`flex flex-col items-center ${
            isTasteSuggestOpen ? 'text-coral' : 'text-text-light'
          }`}
        >
          <FaMagic className="text-2xl" />
          <span className="text-xs mt-1">맞춤 추천</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavbar;
