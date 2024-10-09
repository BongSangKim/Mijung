import { FaMinus } from 'react-icons/fa';
import { Button } from '@/shared/components/Button';

interface MyIngredientsProps {
  ingredients: Array<{ id: number; name: string }>;
  onRemove: (id: number) => void;
  onClear: () => void;
}

export const MyIngredients = ({
  ingredients,
  onRemove,
  onClear,
}: MyIngredientsProps) => {
  return (
    <div className="mb-6">
      {/* <h2 className="text-2xl font-bold mb-3 text-mint uppercase">나의 식재료</h2> */}
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ingredient) => (
          <div
            key={ingredient.id}
            className="flex items-center bg-peach-light p-2 rounded"
          >
            <span className="text-text-dark mr-2">{ingredient.name}</span>
            <button
              onClick={() => onRemove(ingredient.id)}
              className="text-coral hover:text-coral-dark transition-colors duration-300"
              aria-label="제거"
            >
              <FaMinus size={16} />
            </button>
          </div>
        ))}
      </div>
      {ingredients.length > 0 && (
        <Button
          onClick={onClear}
          variant="secondary"
          size="sm"
          className="mt-3"
        >
          전체 삭제
        </Button>
      )}
    </div>
  );
};
