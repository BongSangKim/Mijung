import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../../app/RoutingLayout/MainLayout';
import RightSideLayout from '../../app/RoutingLayout/RightSideLayout';
import Searchbar from '../../widgets/Searchbar/Searchbar';
import { IngredientList } from '@/features/ingredient/ui/IngredientList';
import { useIngredients } from '@/features/ingredient/api/useIngredients';
import { Button } from '@/shared/components/Button';
import { PulseLoader } from 'react-spinners';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
    12,
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

  const renderPagination = () => {
    if (!data?.pagination) return null;

    const { page, perPage, total } = data.pagination;
    const totalPages = Math.ceil(total / perPage);

    const pageNumbers = [];
    const maxPageButtons = 9;
    let startPage = Math.max(1, page - Math.floor(maxPageButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="mt-4 flex flex-col items-center">
        <span className="text-sm text-gray-700 mb-2">
          총 {total}개 중 {page} 페이지 (전체 {totalPages} 페이지)
        </span>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            variant="secondary"
            size="sm"
            className="bg-mint hover:bg-mint-dark text-white"
          >
            <FaChevronLeft />
          </Button>
          {pageNumbers.map((number) => (
            <Button
              key={number}
              onClick={() => handlePageChange(number)}
              variant={page === number ? 'primary' : 'secondary'}
              size="sm"
              className={
                page === number
                  ? 'bg-mint text-white'
                  : 'bg-white text-[#4DB6AC] border border-mint hover:bg-mint hover:text-white'
              }
            >
              {number}
            </Button>
          ))}
          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            variant="secondary"
            size="sm"
            className="bg-mint hover:bg-mint-dark text-white"
          >
            <FaChevronRight />
          </Button>
        </div>
      </div>
    );
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
            <div className="flex flex-col justify-center items-center h-64">
              <PulseLoader color="#4A90E2" size={15} margin={2} />
              <p className="mt-4 text-xl text-text-light">
                식재료 정보를 불러오는 중...
              </p>
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
            <>
              <IngredientList
                ingredients={data?.ingredients || []}
                pagination={data?.pagination}
                onPageChange={handlePageChange}
              />
              {renderPagination()}
            </>
          )}
        </div>
      </MainLayout>
      <RightSideLayout />
    </div>
  );
};

export default IngredientListPage;
