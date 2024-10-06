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
      <h2 className="text-2xl font-bold mb-3 text-mint uppercase">나의 식재료</h2>
      <ul className="space-y-2">
        {ingredients.map((ingredient) => (
          <li
            key={ingredient.id}
            className="flex justify-between items-center bg-peach-light p-2 rounded"
          >
            <span className="text-text-dark">{ingredient.name}</span>
            <Button
              onClick={() => onRemove(ingredient.id)}
              variant="secondary"
              size="sm"
            >
              삭제
            </Button>
          </li>
        ))}
      </ul>
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