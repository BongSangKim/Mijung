import { Link } from 'react-router-dom';
import { IngredientRecommendation } from '@/shared/api/tasteSuggestTypes';

interface RecommendedIngredientsProps {
  ingredients: IngredientRecommendation[];
  onAdd: (id: number, name: string) => void;
}

export const RecommendedIngredients = ({
  ingredients,
  onAdd,
}: RecommendedIngredientsProps) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2 text-mint">추천 식재료</h3>
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ingredient) => (
          <div
            key={ingredient.ingredientId}
            className="flex items-center bg-background-light p-1 rounded"
          >
            <Link
              to={`/ingredients/${ingredient.ingredientId}`}
              className="text-sm text-text-dark hover:text-mint transition-colors duration-300 mr-2"
            >
              {ingredient.name}
            </Link>
            <button
              onClick={() => onAdd(ingredient.ingredientId, ingredient.name)}
              className="text-xs text-coral hover:text-coral-dark transition-colors duration-300"
            >
              추가
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
