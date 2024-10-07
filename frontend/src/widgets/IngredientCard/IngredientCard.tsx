import { useNavigate } from 'react-router-dom';
import { Ingredient, IngredientSise } from '../../shared/api/ingredientTypes';
import { useMyIngredientsStore } from '@/shared/stores/myIngredientsStore';
import { Button } from '@/shared/components/Button';

interface IngredientCardProps {
  ingredient: Ingredient | IngredientSise;
  disableNavigation?: boolean; // 네비게이션 비활성화 여부를 결정하는 prop
}

const IngredientCard = ({ ingredient, disableNavigation = false }: IngredientCardProps): JSX.Element => {
  const navigate = useNavigate();
  const { ingredients, addIngredient, removeIngredient } = useMyIngredientsStore();

  const isInMyIngredients = ingredients.some((i) => i.id === ingredient.ingredientId);

  const handleCardClick = () => {
    // disableNavigation이 false일 때만 상세 페이지로 이동
    if (!disableNavigation) {
      navigate(`/ingredients/${ingredient.ingredientId}`);
    }
  };

  const handleAddOrRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInMyIngredients) {
      removeIngredient(ingredient.ingredientId);
    } else {
      addIngredient(ingredient.ingredientId, ingredient.name);
    }
  };

  const formatPrice = (price: string | number | undefined | null) => {
    if (price === undefined || price === null) return '가격 정보 없음';
    return `${Number(price).toLocaleString()}원`;
  };

  // const getPriceChangeColor = (changeRate: number | undefined | null) => {
  //   if (changeRate === undefined || changeRate === null) return 'text-gray-400';
  //   return changeRate >= 0 ? 'text-red-500' : 'text-blue-500';
  // };

  return (
    <div
      className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-[300px] group"
      onClick={handleCardClick}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={ingredient.image || '/default-ingredient.jpg'}
          alt={ingredient.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-dark mb-2">{ingredient.name}</h3>
          {ingredient?.price ? (
            <p className="text-xl font-bold text-black-500 mt-2">
              {formatPrice(ingredient.price)} / {ingredient.retailUnit}
            </p>
          ) : (
            <p className="text-lg text-gray-400 mt-2">가격정보 없음</p>
          )}
          {ingredient?.changeRate !== undefined && ingredient?.changePrice !== undefined && (
            <p className={`text-sm ${ingredient.changeRate >= 0 ? 'text-red-500' : 'text-blue-500'} mt-1`}>
              {ingredient.changeRate >= 0 ? '▲' : '▼'} {Math.abs(ingredient.changeRate).toFixed(1)}%
              ({formatPrice(Math.abs(ingredient.changePrice))})
            </p>
          )}
        </div>
        <Button
          variant={isInMyIngredients ? "secondary" : "primary"}
          size="sm"
          onClick={handleAddOrRemove}
          className="mt-2 w-full"
        >
          {isInMyIngredients ? '장바구니에서 제거' : '장바구니에 추가'}
        </Button>
      </div>
    </div>
  );
};

export default IngredientCard;