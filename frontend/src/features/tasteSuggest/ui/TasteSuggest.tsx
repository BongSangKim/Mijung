import { useState } from 'react';
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

export const TasteSuggest = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const { ingredients, addIngredient, removeIngredient, clearIngredients } =
    useMyIngredientsStore();

  const { data: recommendedIngredients, refetch: refetchIngredients } =
    useIngredientRecommendations(ingredients.map((i) => i.id));
  const { data: recommendedRecipes, refetch: refetchRecipes } =
    useRecipeRecommendations(ingredients.map((i) => i.id));

  const handleGetRecommendations = () => {
    refetchIngredients();
    refetchRecipes();
  };

  const handleSearch = (keyword: string) => {
    console.log('검색어:', keyword);
    // 이 함수는 사용되지 않지만, Searchbar prop으로 필요합니다.
  };

  const handleSuggestItemClick = (item: { id: number; name: string }) => {
    addIngredient(item.id, item.name);
  };

  const content = (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-shadow duration-500 hover:shadow-xl">
      <div className="p-6">
        <Searchbar
          type="ingredients"
          onSearch={handleSearch}
          isSuggestSearch={true}
          onSuggestItemClick={handleSuggestItemClick}
        />
        <MyIngredients
          ingredients={ingredients}
          onRemove={removeIngredient}
          onClear={clearIngredients}
        />
        <button
          onClick={handleGetRecommendations}
          className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-full uppercase font-bold text-sm hover:bg-blue-600 transition-colors duration-300 shadow-md hover:shadow-lg"
        >
          추천 받기
        </button>
        {recommendedIngredients && (
          <RecommendedIngredients
            ingredients={recommendedIngredients}
            onAdd={addIngredient}
          />
        )}
        {recommendedRecipes && (
          <RecommendedRecipes recipes={recommendedRecipes} />
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300"
        >
          추천
        </button>
        {isModalOpen && (
          <div className="fixed inset-0 bg-white z-50 overflow-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 text-3xl text-gray-600 hover:text-gray-800"
            >
              &times;
            </button>
            {content}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-shadow duration-500 hover:shadow-xl">
      {content}
    </div>
  );
};
