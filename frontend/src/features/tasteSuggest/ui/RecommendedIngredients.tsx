import { Link } from 'react-router-dom';
import { IngredientRecommendation } from '@/shared/api/tasteSuggestTypes';
import { FaPlus } from 'react-icons/fa';

interface RecommendedIngredientsProps {
  ingredients: IngredientRecommendation[];
  oldIngredients: IngredientRecommendation[];
  onAdd: (id: number, name: string) => void;
  onItemClick: () => void;
}

export const RecommendedIngredients = ({
  ingredients,
  oldIngredients,
  onAdd,
  onItemClick,
}: RecommendedIngredientsProps) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-3 text-mint">추천 식재료</h3>
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ingredient) => (
          <div
            key={ingredient.ingredientId}
            className="flex items-center justify-between bg-peach-light rounded-lg p-2 shadow-sm"
          >
            <Link
              to={`/ingredients/${ingredient.ingredientId}`}
              className="text-sm text-text-dark hover:text-mint transition-colors duration-300 mr-2"
              onClick={onItemClick}
            >
              {ingredient.name}
            </Link>
            <button
              onClick={() => onAdd(ingredient.ingredientId, ingredient.name)}
              className="text-mint hover:text-mint-dark transition-colors duration-300"
              aria-label="추가"
            >
              <FaPlus size={16} />
            </button>
          </div>
        ))}
        {oldIngredients.map((ingredient) => (
          <div
            key={ingredient.ingredientId}
            className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm"
          >
            <Link
              to={`/ingredients/${ingredient.ingredientId}`}
              className="text-sm text-text-dark hover:text-mint transition-colors duration-300 mr-2"
              onClick={onItemClick}
            >
              {ingredient.name}
            </Link>
            <button
              onClick={() => onAdd(ingredient.ingredientId, ingredient.name)}
              className="text-mint hover:text-mint-dark transition-colors duration-300"
              aria-label="추가"
            >
              <FaPlus size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
