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
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-3 text-mint uppercase">추천 식재료</h2>
      <ul className="space-y-2">
        {ingredients.map((ingredient) => (
          <li
            key={ingredient.ingredientId}
            className="flex justify-between items-center bg-background-light p-2 rounded"
          >
            <Link
              to={`/ingredients/${ingredient.ingredientId}`}
              className="text-text-dark hover:text-mint transition-colors duration-300"
            >
              {ingredient.name}
            </Link>
            <button
              onClick={() => onAdd(ingredient.ingredientId, ingredient.name)}
              className="text-coral hover:text-coral-dark transition-colors duration-300"
            >
              추가
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
