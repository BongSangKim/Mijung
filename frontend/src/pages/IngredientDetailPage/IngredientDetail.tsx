import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../app/RoutingLayout/MainLayout';
import RightSideLayout from '../../app/RoutingLayout/RightSideLayout';
import PriceGraphCard from '../../widgets/PriceGraphCard/PriceGraphCard';
import NetworkGraphCard from '../../widgets/NetworkGraphCard/NetworkGraphCard';
import { useIngredientInfo } from '../../features/ingredient/api/useIngredients';
import {
  useIngredientRecommendRecipes,
  RecommendedRecipe,
} from '../../features/ingredient/api/useIngredientRecommendRecipes';
import { FaArrowLeft } from 'react-icons/fa';

// 배경색에 따라 텍스트 색상을 결정하는 함수
const getContrastColor = (hexColor: string) => {
  // HEX to RGB 변환
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // 밝기 계산
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // 밝기에 따라 검정 또는 흰색 반환
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

// 파스텔톤 색상으로 변환하는 함수
const toPastelColor = (hexColor: string) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const pastelR = Math.round((r + 255) / 2);
  const pastelG = Math.round((g + 255) / 2);
  const pastelB = Math.round((b + 255) / 2);

  return `#${pastelR.toString(16).padStart(2, '0')}${pastelG.toString(16).padStart(2, '0')}${pastelB.toString(16).padStart(2, '0')}`;
};

// interface IngredientRecommendRecipeResponse {
//   data: RecommendedRecipe[];
// }

const IngredientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: ingredientInfo,
    isLoading,
    error,
  } = useIngredientInfo(Number(id));
  const { data: recommendedRecipesResponse, isLoading: isLoadingRecipes } =
    useIngredientRecommendRecipes(Number(id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러가 발생했습니다.</div>;
  if (!ingredientInfo) return <div>식재료 정보가 없습니다.</div>;

  const {
    ingredientId,
    name,
    retailUnit,
    retailUnitsize,
    image,
    price,
    changeRate,
    changePrice,
    colorHex,
  } = ingredientInfo;
  const [primaryColor] = colorHex?.split(',') ?? ['#FFFFFF'];
  const pastelColor = toPastelColor(primaryColor);
  const textColor = getContrastColor(pastelColor);

  const formatPrice = (price: number | null | undefined) => {
    return price != null ? price.toLocaleString('ko-KR') : '정보 없음';
  };

  return (
    <>
      <div
        className="w-full py-8 px-4 mb-8 relative"
        style={{ backgroundColor: pastelColor, color: textColor }}
      >
        <button
          onClick={handleGoBack}
          className="absolute left-4 top-4 bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800 rounded-full p-2 transition-all duration-200"
          style={{ color: textColor }}
        >
          <FaArrowLeft size={24} />
        </button>
        <div className="container mx-auto flex flex-col sm:flex-row items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
            <img
              src={image ?? '/default-image.png'}
              alt={name ?? '식재료 이미지'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow text-center sm:text-left">
            <h1 className="text-4xl font-bold mb-4">
              {name ?? '알 수 없는 식재료'}
            </h1>
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end">
              <div>
                <p className="text-3xl font-semibold mb-2">
                  {price != null
                    ? `${formatPrice(Number(price))}원`
                    : '정보 없음'}
                </p>
                {retailUnitsize && retailUnit && (
                  <p className="text-lg opacity-80">
                    {retailUnitsize}
                    {retailUnit} 기준
                  </p>
                )}
              </div>
              <div className="text-center sm:text-right mt-4 sm:mt-0">
                {changeRate != null && (
                  <p
                    className={`text-2xl font-bold ${changeRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}
                  >
                    {changeRate >= 0 ? '▲' : '▼'}{' '}
                    {Math.abs(changeRate).toFixed(1)}%
                  </p>
                )}
                {changePrice != null && (
                  <p className="text-lg opacity-80">
                    {formatPrice(Math.abs(changePrice))}원{' '}
                    {changePrice >= 0 ? '상승' : '하락'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-10">
        <MainLayout>
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-8">
              <div className="w-full max-w-4xl mt-8 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">추천 레시피</h2>
                {isLoadingRecipes ? (
                  <p>레시피 로딩 중...</p>
                ) : recommendedRecipesResponse?.data &&
                  recommendedRecipesResponse.data.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {recommendedRecipesResponse.data.map((recipe) => (
                      <RecipeCard
                        key={recipe.recipeId}
                        recipe={recipe}
                        onClick={() => navigate(`/recipes/${recipe.recipeId}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <p>추천 레시피가 없습니다.</p>
                )}
              </div>
              <div className="w-full max-w-4xl">
                <NetworkGraphCard
                  graphId={ingredientId}
                  title={`${name ?? '식재료'} 관련 네트워크 그래프`}
                />
              </div>
              <div className="w-full max-w-4xl">
                <PriceGraphCard
                  graphId={ingredientId}
                  title={`${name ?? '식재료'} 가격 추이`}
                />
              </div>
            </div>
          </div>
        </MainLayout>
        <RightSideLayout />
      </div>
    </>
  );
};

export default IngredientDetailPage;

// RecipeCard 컴포넌트
const RecipeCard = ({
  recipe,
  onClick,
}: {
  recipe: RecommendedRecipe;
  onClick: () => void;
}) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
      onClick={onClick}
    >
      <img
        src={recipe.image || '/default-recipe-image.png'}
        alt={recipe.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{recipe.name}</h3>
        <p className="text-sm text-gray-600">{recipe.kind}</p>
      </div>
    </div>
  );
};
