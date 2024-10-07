import { Link } from 'react-router-dom';
import { RecipeRecommendation } from '@/shared/api/tasteSuggestTypes';

interface RecommendedRecipesProps {
  recipes: RecipeRecommendation[] | undefined;
}

export const RecommendedRecipes = ({ recipes }: RecommendedRecipesProps) => {
  if (!recipes || recipes.length === 0) {
    return <div className="text-text-light">추천 레시피가 없습니다.</div>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-3 text-coral">추천 레시피</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {recipes.map((recipe) => (
          <Link
            key={recipe.recipeId}
            to={`/recipes/${recipe.recipeId}`}
            className="bg-background-light rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
          >
            <div className="relative pb-[100%]">
              <img
                src={recipe.image || 'default-recipe-image.jpg'}
                alt={recipe.name}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-2">
              <div
                className="font-semibold text-sm text-text-dark truncate"
                title={recipe.name}
              >
                {recipe.name}
              </div>
              <div className="text-xs text-sunflower mt-1">{recipe.kind}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
