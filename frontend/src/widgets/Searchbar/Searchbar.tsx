import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIngredientAutoComplete } from '../../features/ingredient/api/useIngredients';

interface SearchbarProps {
  type: 'ingredients' | 'recipes';
  onSearch: (keyword: string) => void;
  isSuggestSearch?: boolean;
  onSuggestItemClick?: (item: { id: number; name: string }) => void;
}

const Searchbar = ({
  type,
  onSearch,
  isSuggestSearch = false,
  onSuggestItemClick,
}: SearchbarProps) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: ingredientSuggestions } = useIngredientAutoComplete(
    type === 'ingredients' ? keyword : ''
  );
  // const { data: recipeSuggestions } =
  //   useRecipeAutoComplete(type === 'recipes' ? keyword : '');

  const suggestions =
    type === 'ingredients'
      ? ingredientSuggestions
      : console.log('recipeSuggestions');

  useEffect(() => {
    if (keyword.length > 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsDropdownOpen(true);
      }, 300);
    } else {
      setIsDropdownOpen(false);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [keyword]);

  const handleSearch = () => {
    if (isSuggestSearch && suggestions && suggestions.length > 0) {
      const firstSuggestion = suggestions[0];
      onSuggestItemClick?.({
        id: firstSuggestion.ingredientId,
        name: firstSuggestion.name,
      });
    } else {
      onSearch(keyword);
    }
    setIsDropdownOpen(false);
  };

  const handleItemClick = (item: { id: number; name: string }) => {
    if (isSuggestSearch && onSuggestItemClick) {
      onSuggestItemClick(item);
    } else {
      setKeyword(item.name);
      setIsDropdownOpen(false);

      if (type === 'ingredients') {
        navigate(`/ingredients/${item.id}`);
      } else {
        navigate(`/recipes/${item.id}`);
      }
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={type === 'ingredients' ? '식재료 검색' : '레시피 검색'}
      />
      {isDropdownOpen && suggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {suggestions.map((item: { ingredientId: number; name: string }) => (
            <li
              key={item.ingredientId}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() =>
                handleItemClick({ id: item.ingredientId, name: item.name })
              }
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Searchbar;
