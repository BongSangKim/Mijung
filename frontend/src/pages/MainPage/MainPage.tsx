import MainLayout from '../../app/RoutingLayout/MainLayout';
import RightSideLayout from '../../app/RoutingLayout/RightSideLayout';
import { IngredientSiseList } from '@/features/ingredient/ui/IngredientSiseList';
import { useIngredientSise } from '@/features/ingredient/api/useIngredients';

const MainPage = () => {
  const {
    data: weeklyIngredients,
    isError: isWeeklyError,
    error: weeklyError,
  } = useIngredientSise({ period: 'week', change: 'negative', count: 4 });
  const {
    data: monthlyIngredients,
    isError: isMonthlyError,
    error: monthlyError,
  } = useIngredientSise({ period: 'month', change: 'negative', count: 4 });
  const {
    data: mainIngredients,
    isError: isMainError,
    error: mainError,
  } = useIngredientSise({
    period: 'year',
    change: 'negative',
    count: 4,
  });

  if (isWeeklyError || isMonthlyError || isMainError) {
    console.error('데이터 로딩 오류', {
      weeklyError,
      monthlyError,
      mainError,
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 bg-background">
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-text-dark">
            실시간 식재료 가격
          </h1>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-coral-dark">
              이번 주 특가 식재료
            </h2>
            <p className="text-text-light mb-4">
              지난 주보다 가격이 내려간 식재료예요
            </p>
            <IngredientSiseList
              ingredients={weeklyIngredients ?? []}
              title="주간 시세"
            />
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-coral-dark">
              이번 달 인기 식재료
            </h2>
            <p className="text-text-light mb-4">
              지난 달보다 많이 팔린 식재료예요
            </p>
            <IngredientSiseList
              ingredients={monthlyIngredients ?? []}
              title="월간 시세"
            />
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-coral-dark">
              연중 저렴한 식재료
            </h2>
            <p className="text-text-light mb-4">
              1년 내내 가격 변동이 적은 식재료예요
            </p>
            <IngredientSiseList
              ingredients={mainIngredients ?? []}
              title="주요 식재료"
            />
          </div>
        </div>
      </MainLayout>
      <RightSideLayout />
    </div>
  );
};

export default MainPage;
