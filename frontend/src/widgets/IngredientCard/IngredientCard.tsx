import { useNavigate } from 'react-router-dom';
import { Ingredient, IngredientSise } from '../../shared/api/ingredientTypes';
import { useMyIngredientsStore } from '@/shared/stores/myIngredientsStore';

interface IngredientCardProps {
  ingredient: Ingredient | IngredientSise;
}

const IngredientCard = ({ ingredient }: IngredientCardProps): JSX.Element => {
  const navigate = useNavigate();
  const { ingredients, addIngredient, removeIngredient } =
    useMyIngredientsStore();

  const isInMyIngredients = ingredients.some(
    (i) => i.id === ingredient.ingredientId
  );

  const handleCardClick = () => {
    navigate(`/ingredients/${ingredient.ingredientId}`);
  };

  const handleAddOrRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInMyIngredients) {
      removeIngredient(ingredient.ingredientId);
    } else {
      addIngredient(ingredient.ingredientId, ingredient.name);
    }
  };

  const formatChange = (value: number | undefined) => {
    if (value === undefined) return '가격 등락 정보 없음';
    const absValue = Math.abs(value).toFixed(1);
    return `${absValue}%`;
  };

  const formatPrice = (price: string | number | undefined) => {
    if (price === undefined) return '가격 정보 없음';
    return `${Number(price).toLocaleString()}원`;
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 flex flex-col h-[300px]"
      onClick={handleCardClick}
    >
      {ingredient?.image ? (
        <img
          src={ingredient.image}
          alt={ingredient.name ?? '재료 이미지'}
          className="w-full h-2/5 object-cover"
        />
      ) : (
        <div className="w-full h-2/5 bg-gray-200 flex items-center justify-center text-gray-500">
          이미지 없음
        </div>
      )}
      <div className="p-2 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold mb-1 truncate">
            {ingredient?.name ? (
              <>
                {ingredient.name}{' '}
                {ingredient?.retailUnit && ingredient?.retailUnitsize ? (
                  `(${ingredient.retailUnitsize}${ingredient.retailUnit})`
                ) : (
                  <span className="text-gray-500 text-xs">
                    {/* (Dev:단위 정보 없음) */}
                    {/* UX 관점에서는, 단위없으면 아예 생략 고려 */}
                  </span>
                )}
              </>
            ) : (
              '식재료 정보 없음'
            )}
          </h3>
          {ingredient?.price ? (
            <>
              <p className="text-lg font-bold mb-1">
                {formatPrice(ingredient.price)}
              </p>
              {ingredient?.changeRate !== undefined &&
                ingredient?.changePrice !== undefined && (
                  <div
                    className={`text-xs flex items-center ${ingredient.changeRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}
                  >
                    <span className="mr-1">
                      {ingredient.changeRate >= 0 ? '▲' : '▼'}
                    </span>
                    <span>{formatChange(ingredient.changeRate)}</span>
                    <span className="ml-1">
                      ({formatPrice(Math.abs(ingredient.changePrice))})
                    </span>
                  </div>
                )}
            </>
          ) : (
            <p className="text-lg font-bold mb-1 text-gray-500">
              가격정보 없음
            </p>
          )}
        </div>
        <button
          className={`mt-2 ${
            isInMyIngredients
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white px-2 py-1 rounded text-xs w-full`}
          onClick={handleAddOrRemove}
        >
          {isInMyIngredients ? '식탁에서 제거' : '식탁에 추가'}
        </button>
      </div>
    </div>
  );
};

export default IngredientCard;
