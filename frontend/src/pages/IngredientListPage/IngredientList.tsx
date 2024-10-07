import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../../app/RoutingLayout/MainLayout';
import RightSideLayout from '../../app/RoutingLayout/RightSideLayout';
import Searchbar from '../../widgets/Searchbar/Searchbar';
import { IngredientList } from '@/features/ingredient/ui/IngredientList';
import { useIngredients } from '@/features/ingredient/api/useIngredients';
import { Button } from '@/shared/components/Button';

const categories = [
  { id: 'all', name: '전체' },
  { id: '100', name: '식량작물' },
  { id: '200', name: '채소류' },
  { id: '300', name: '특용작물' },
  { id: '400', name: '과일류' },
  { id: '500', name: '축산물' },
  { id: '600', name: '수산물' },
  { id: '700', name: '기타' },
];

const IngredientListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const currentPage = Number(searchParams.get('page')) || 1;
  const keyword = searchParams.get('keyword') || '';

  const { data, isLoading, error } = useIngredients(
    currentPage,
    10,
    category,
    keyword
  );

  const handleCategoryChange = (newCategory: string) => {
    setSearchParams({ category: newCategory, page: '1', keyword });
  };

  const handleSearch = (searchKeyword: string) => {
    setSearchParams({ category: 'all', page: '1', keyword: searchKeyword });
  };

  const handleItemSelect = (item: { id: number; name: string }) => {
    navigate(`/ingredients/${item.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ category, page: newPage.toString(), keyword });
  };

  return (
    <div className="grid grid-cols-10 bg-background">
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-blueberry">
            식재료 목록
          </h1>
          <Searchbar
            type="ingredients"
            onSearch={handleSearch}
            onItemSelect={handleItemSelect}
            initialValue={keyword}
          />
          <div className="mt-6 mb-8">
            <h2 className="text-xl font-semibold mb-3 text-coral">카테고리</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  variant={category === cat.id ? 'primary' : 'secondary'}
                  className="rounded-full"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-xl text-text-light">로딩 중...</p>
            </div>
          ) : error ? (
            <div
              className="bg-peach-light border border-coral text-text-dark px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">오류 발생!</strong>
              <span className="block sm:inline">
                {' '}
                데이터를 불러오는 데 실패했습니다. 다시 시도해 주세요.
              </span>
            </div>
          ) : (
            <IngredientList
              ingredients={data?.ingredients || []}
              pagination={data?.pagination}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </MainLayout>
      <RightSideLayout />
    </div>
  );
};

export default IngredientListPage;
