import { useState, useEffect } from 'react';
import { MyIngredients } from './MyIngredients';
import { RecommendedIngredients } from './RecommendedIngredients';
import { RecommendedRecipes } from './RecommendedRecipes';
import {
  useIngredientRecommendations,
  useRecipeRecommendations,
} from '../api/useTasteSuggest';
import { useIsMobile } from '@/shared/hooks/useIsMobile';
import { useMyIngredientsStore } from '@/shared/stores/myIngredientsStore';
import Searchbar from '@/widgets/Searchbar/Searchbar';
import { checkKoreanIga } from '@/shared/utils/checkKorean';

interface TasteSuggestProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TasteSuggest = ({ isOpen }: TasteSuggestProps) => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const isMobile = useIsMobile();

  const { ingredients, addIngredient, removeIngredient, clearIngredients } =
    useMyIngredientsStore();

  const { data: recommendedIngredients } = useIngredientRecommendations(
    ingredients.map((i) => i.id)
  );
  const { data: recommendedRecipes } = useRecipeRecommendations(
    ingredients.map((i) => i.id)
  );

  const [searchKeyword, setSearchKeyword] = useState('');
  const [addedIngredient, setAddedIngredient] = useState<string | null>(null);
  const [showClearAlert, setShowClearAlert] = useState(false);

  useEffect(() => {
    if (addedIngredient) {
      const timer = setTimeout(() => {
        setAddedIngredient(null);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [addedIngredient]);

  useEffect(() => {
    if (showClearAlert) {
      const timer = setTimeout(() => {
        setShowClearAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showClearAlert]);

  const handleSuggestItemClick = (item: { id: number; name: string }) => {
    addIngredient(item.id, item.name);
    setSearchKeyword(''); // 검색어 초기화
    setAddedIngredient(item.name);
  };

  const handleClearIngredients = () => {
    clearIngredients();
    setShowClearAlert(true);
  };

  const tabContent = (
    <div className="flex-grow overflow-auto">
      {activeTab === 'ingredients' && recommendedIngredients && (
        <RecommendedIngredients
          ingredients={recommendedIngredients}
          onAdd={addIngredient}
        />
      )}
      {activeTab === 'recipes' && recommendedRecipes && (
        <RecommendedRecipes recipes={recommendedRecipes} />
      )}
    </div>
  );

  const tabBar = (
    <div className="flex justify-around items-center bg-gradient-to-b from-gray-100 to-gray-200 border-t border-gray-300 p-3 rounded-t-2xl shadow-lg">
      <button
        onClick={() => setActiveTab('ingredients')}
        className={`flex-1 py-2 px-4 text-center relative rounded-lg transition-all duration-300 ${
          activeTab === 'ingredients'
            ? 'bg-mint text-white font-bold shadow-md'
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        }`}
      >
        식재료 추천받기
      </button>
      <div className="w-px h-8 bg-gray-400 mx-2"></div>
      <button
        onClick={() => setActiveTab('recipes')}
        className={`flex-1 py-2 px-4 text-center relative rounded-lg transition-all duration-300 ${
          activeTab === 'recipes'
            ? 'bg-mint text-white font-bold shadow-md'
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        }`}
      >
        레시피 추천받기
      </button>
    </div>
  );

  const content = (
    <div className="bg-background rounded-2xl overflow-hidden transition-shadow duration-500 h-full flex flex-col h-full">
      <div className="p-6 flex-grow overflow-auto h-full">
        <h2 className="text-3xl font-bold mb-4 text-blueberry">
          나만의 요리 도우미
        </h2>
        <p className="text-text-light mb-4">
          가지고 있는 재료나 사고 싶은 재료를 추가해보세요
        </p>
        <Searchbar
          type="ingredients"
          onSearch={() => {}}
          isSuggestSearch={true}
          onSuggestItemClick={handleSuggestItemClick}
          value={searchKeyword}
          onChange={setSearchKeyword}
        />
        {addedIngredient && (
          <div className="mt-2 text-green-600 font-semibold">
            {addedIngredient}
            {checkKoreanIga(addedIngredient)} 추가되었습니다.
          </div>
        )}
        <MyIngredients
          ingredients={ingredients}
          onRemove={removeIngredient}
          onClear={handleClearIngredients}
        />
        {showClearAlert && (
          <div className="mt-2 text-red-600 font-semibold">
            모든 재료가 삭제되었습니다.
          </div>
        )}
        {tabContent}
      </div>
      {tabBar}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-white z-40 flex flex-col pb-16">
            {content}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="fixed top-16 right-0 w-full lg:w-[30%] bg-background shadow-lg h-[calc(100vh-4rem)] flex flex-col">
      {content}
    </div>
  );
};
