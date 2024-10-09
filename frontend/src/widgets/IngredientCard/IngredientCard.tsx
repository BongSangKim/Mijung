import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ingredient, IngredientSise } from '../../shared/api/ingredientTypes';
import { useMyIngredientsStore } from '@/shared/stores/myIngredientsStore';
import { Button } from '@/shared/components/Button';
import { FaSpinner } from 'react-icons/fa';
import { checkKoreanRo } from '@/shared/utils/checkKorean';

interface IngredientCardProps {
  ingredient: Ingredient | IngredientSise;
  disableNavigation?: boolean; // 네비게이션 비활성화 여부를 결정하는 prop. 랜딩페이지에서 클릭해도 랜딩페이지에 있기 위한 용도
  onOpenTasteSuggest?: (ingredientId: number, name: string) => void;
}

const IngredientCard = ({
  ingredient,
  disableNavigation = false,
}: IngredientCardProps): JSX.Element => {
  const navigate = useNavigate();
  const { ingredients, addIngredient, removeIngredient } =
    useMyIngredientsStore();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isInMyIngredients = ingredients.some(
    (i) => i.id === ingredient.ingredientId
  );

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

  const formatUnit = (
    retailUnitsize: string | null | undefined,
    retailUnit: string | null | undefined
  ) => {
    if (retailUnitsize == null || retailUnit == null) return '';
    const size = Number(retailUnitsize);
    if (size > 1) {
      return `${size}${retailUnit}`;
    }
    return retailUnit;
  };

  const getPriceChangeInfo = (
    changeRate: number | undefined | null,
    changePrice: number | undefined | null
  ) => {
    if (changeRate == null || changePrice == null) {
      return { text: '변동 정보 없음', color: 'text-gray-500' };
    }

    if (changeRate === 0 || changeRate === 0.0) {
      return { text: '변동 없음', color: 'text-gray-500' };
    }

    const isIncrease = changeRate > 0;
    return {
      text: `${isIncrease ? '▲' : '▼'} ${Math.abs(changeRate).toFixed(1)}% (${formatPrice(Math.abs(changePrice))})`,
      color: isIncrease ? 'text-red-500' : 'text-blue-500',
    };
  };

  return (
    <div
      className="bg-white shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-[300px] group cursor-pointer rounded-t-2xl"
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden rounded-t-2xl">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <FaSpinner className="animate-spin text-4xl text-gray-500" />
          </div>
        )}
        <img
          src={ingredient.image || '/public/images/vetables.png'}
          alt={ingredient.name || '식재료 이미지'}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
          <span className="inline-block px-3 py-1.5 bg-white bg-opacity-80 text-black text-base font-bold rounded-full shadow-md">
            {ingredient.name || '이름 없음'}
          </span>
        </div>
      </div>
      <div className="pt-2 pb-3 px-5 flex-grow flex flex-col justify-between">
        <div>
          <p className="text-xl font-bold text-black-500">
            {formatPrice(ingredient.price)}/
            {formatUnit(ingredient.retailUnitsize, ingredient.retailUnit) ||
              '단위 정보 없음'}
          </p>
          <p
            className={`text-sm ${getPriceChangeInfo(ingredient.changeRate, ingredient.changePrice).color} mt-1`}
          >
            {
              getPriceChangeInfo(ingredient.changeRate, ingredient.changePrice)
                .text
            }
          </p>
        </div>
      </div>
      <Button
        variant={isInMyIngredients ? 'secondary' : 'primary'}
        size="sm"
        onClick={handleAddOrRemove}
        className="mt-auto w-full py-2 flex items-center justify-center transition-colors duration-300"
      >
        {isInMyIngredients
          ? '목록에서 제거'
          : `${ingredient.name || '식재료'}${checkKoreanRo(ingredient.name || '식재료')} 추천받기`}
      </Button>
    </div>
  );
};

export default IngredientCard;
