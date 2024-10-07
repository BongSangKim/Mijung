import LeftSideLayout from '@/app/RoutingLayout/LeftSideLayout';
import MainLayout from '@/app/RoutingLayout/MainLayout';
import RightSideLayout from '@/app/RoutingLayout/RightSideLayout';
import { useRecipeStore } from '@/shared/stores/jjimStore';
import { defaultRecipeImg } from '@/shared/url/defualtImage';
import { FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RecipeJjimDetail = () => {
  const { savedRecipes, removeRecipe } = useRecipeStore();
  const navigate = useNavigate();

  const handleRemove = (recipeId: number) => {
    removeRecipe(recipeId);
  };

  const handleRecipeClick = (recipeId: number) => {
    navigate(`/recipes/${recipeId}`);
  };

  return (
    <div className="grid grid-cols-10">
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">찜한 레시피 목록</h1>
          {savedRecipes.length === 0 ? (
            <p className="text-gray-700 text-center">
              저장된 레시피가 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedRecipes.map((recipe) => (
                <div
                  key={recipe.recipeId}
                  className=" relative bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <img
                    src={recipe.image || defaultRecipeImg}
                    alt={recipe.name}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => handleRecipeClick(recipe.recipeId)}
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2">
                      {recipe.name}
                    </h2>
                    <p className="text-gray-600 mb-4">{recipe.kind}</p>
                    <button
                      onClick={() => handleRemove(recipe.recipeId)}
                      className="absolute top-2 left-2 p-1 bg-white rounded-full shadow-md"
                    >
                      <FaHeart className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </MainLayout>
      <RightSideLayout />
    </div>
  );
};

export default RecipeJjimDetail;
