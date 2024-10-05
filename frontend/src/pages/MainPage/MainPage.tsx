import MainLayout from '../../app/RoutingLayout/MainLayout';
import RightSideLayout from '../../app/RoutingLayout/RightSideLayout';
import { IngredientSiseList } from '@/features/ingredient/ui/IngredientSiseList';
import { useIngredientSise } from '@/features/ingredient/api/useIngredients';

const MainPage = () => {
  const { data: weeklyIngredients, isError: isWeeklyError } = useIngredientSise(
    { period: 'week', change: 'positive', count: 6 }
  );
  const { data: monthlyIngredients, isError: isMonthlyError } =
    useIngredientSise({ period: 'month', change: 'positive', count: 4 });
  const { data: mainIngredients, isError: isMainError } = useIngredientSise({
    period: 'year',
    change: 'positive',
    count: 4,
  });

  console.log('주간 시세:', weeklyIngredients);
  console.log('월간 시세:', monthlyIngredients);
  console.log('주요 식재료:', mainIngredients);

  if (isWeeklyError || isMonthlyError || isMainError) {
    console.error('데이터 로딩 오류');
    return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10">
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">메인 페이지</h1>
          <IngredientSiseList
            ingredients={weeklyIngredients ?? []}
            title="주간 시세"
          />
          <IngredientSiseList
            ingredients={monthlyIngredients ?? []}
            title="월간 시세"
          />
          <IngredientSiseList
            ingredients={mainIngredients ?? []}
            title="주요 식재료"
          />
        </div>
      </MainLayout>
      <RightSideLayout />
    </div>
  );
};

export default MainPage;
