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
            <IngredientSiseList
              ingredients={weeklyIngredients ?? []}
              title="이번 주 특가 식재료"
            />
          </div>
          <div className="mt-8">
            <IngredientSiseList
              ingredients={monthlyIngredients ?? []}
              title="이번 달 인기 식재료"
            />
          </div>
          <div className="mt-8">
            <IngredientSiseList
              ingredients={mainIngredients ?? []}
              title="올해 저렴한 식재료"
            />
          </div>
        </div>
      </MainLayout>
      <RightSideLayout />
    </div>
  );
};

export default MainPage;
