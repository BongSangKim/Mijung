import { useSearchSuggestion } from '../api/useSearchSuggestion';
import { Recipe } from '@/shared/api/recipeTypes';
import { Error } from '@/shared/components';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/components/Button';
import { FaSearch } from 'react-icons/fa';

interface Props {
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  onSubmit: (keyword: string) => void;
}

export const RecipeSearchBar = ({
  keyword,
  onKeywordChange,
  onSubmit,
}: Props) => {
  const { data: suggestions, error } = useSearchSuggestion(keyword);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const handleSuggestionClick = (suggestion: Recipe) => {
    onSubmit(suggestion.name);
    onKeywordChange(suggestion.name);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (suggestions === undefined) return;

    if (selectedIndex !== -1 && suggestions[selectedIndex]) {
      onSubmit(suggestions[selectedIndex].name);
    } else {
      onSubmit(keyword);
    }
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        setSelectedIndex((prevIndex) =>
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
        );
        setShowSuggestions(true);
        e.preventDefault();
        break;

      case 'ArrowUp':
        setSelectedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
        );
        setShowSuggestions(true);
        e.preventDefault();
        break;

      case 'Enter':
        if (selectedIndex !== -1) {
          onSubmit(suggestions[selectedIndex].name);
          onKeywordChange(suggestions[selectedIndex].name);
          setShowSuggestions(false);
          e.preventDefault();
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  useEffect(() => {
    setSelectedIndex(-1);
    setShowSuggestions(!!suggestions && suggestions.length > 0);
  }, [suggestions]);

  // searchBar 외부 요소(형제, 부모) 클릭 시 ul 숨김
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputFocus = () => {
    setShowSuggestions(!!suggestions && suggestions.length > 0);
  };

  if (error) {
    console.log('ReacipeSearchBar Error');
    return <Error />;
  }

  return (
    <div className="relative min-w-96 mx-auto mb-5" ref={searchBarRef}>
      <form className="flex items-center" onSubmit={(e) => handleSubmit(e)}>
        <input
          type="text"
          placeholder="레시피 검색"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          className="w-full px-4 py-2 text-text-dark bg-background-light border border-peach rounded-l-full focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
        />
        <Button type="submit" variant="primary" className="rounded-l-none">
          <FaSearch />
        </Button>
      </form>
      {suggestions && suggestions.length > 0 && (
        <ul
          className={`absolute z-20 w-full mt-2 bg-background-light border border-peach rounded-lg shadow-lg ${
            showSuggestions ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          aria-hidden={!showSuggestions}
        >
          {suggestions.map((suggestion: Recipe, index: number) => (
            <li
              key={index}
              className={`px-4 py-2 hover:bg-peach-light cursor-pointer ${
                index === selectedIndex ? 'bg-peach-light' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};