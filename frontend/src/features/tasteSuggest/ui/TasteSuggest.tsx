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

interface TasteSuggestProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TasteSuggest = ({ isOpen, onClose }: TasteSuggestProps) => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const isMobile = useIsMobile();

  const { ingredients, addIngredient, removeIngredient, clearIngredients } =
    useMyIngredientsStore();

  const { data: recommendedIngredients, refetch: refetchIngredients } =
    useIngredientRecommendations(ingredients.map((i) => i.id));
  const { data: recommendedRecipes, refetch: refetchRecipes } =
    useRecipeRecommendations(ingredients.map((i) => i.id));

  // const handleGetRecommendations = () => {
  //   refetchIngredients();
  //   refetchRecipes();
  // };

  const handleSearch = (keyword: string) => {
    console.log('검색어:', keyword);
  };

  const handleSuggestItemClick = (item: { id: number; name: string }) => {
    addIngredient(item.id, item.name);
  };

  const content = (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-shadow duration-500 hover:shadow-xl h-full">
      <div className="p-6 flex flex-col h-full">
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
        {/* <button
          onClick={handleGetRecommendations}
          className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-full uppercase font-bold text-sm hover:bg-blue-600 transition-colors duration-300 shadow-md hover:shadow-lg"
        >
          추천 받기
        </button> */}
        <div className="flex mt-4">
          <button
            className={`flex-1 py-2 ${activeTab === 'ingredients' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('ingredients')}
          >
            식재료 추천
          </button>
          <button
            className={`flex-1 py-2 ${activeTab === 'recipes' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('recipes')}
          >
            레시피 추천
          </button>
        </div>
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
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 bg-white z-40 overflow-auto pt-16 pb-20">
            <button
              onClick={onClose}
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
    <div className="fixed top-16 right-0 w-full lg:w-1/5 bg-white shadow-lg overflow-y-auto h-[calc(100vh-4rem)]">
      {content}
    </div>
  );
};
