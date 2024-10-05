import { useState } from 'react';
import MainLayout from '../../app/RoutingLayout/MainLayout';
import RightSideLayout from '../../app/RoutingLayout/RightSideLayout';
import Searchbar from '../../widgets/Searchbar/Searchbar';
import { IngredientList } from '@/features/ingredient/ui/IngredientList';
import { useIngredients } from '@/features/ingredient/api/useIngredients';

const categories = [
  { id: 'all', name: '전체' },
  { id: '100', name: '식량작물' },
  { id: '200', name: '채소류' },
  { id: '300', name: '특용작물' },
  { id: '400', name: '과일류' },
  { id: '500', name: '축산물' },
  { id: '600', name: '수산물' },
];

const IngredientListPage = () => {
  const [category, setCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState<string | null>(null);
  const { data, isLoading, error } = useIngredients(
    currentPage,
    10,
    category,
    keyword
  );

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setCurrentPage(1);
    // 카테고리 변경 시 검색어 초기화
    setKeyword(null);
  };

  const handleSearch = (searchKeyword: string) => {
    setKeyword(searchKeyword);
    setCurrentPage(1);
    // 검색 시 카테고리를 'all'로 설정
    setCategory('all');
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="grid grid-cols-10">
      <MainLayout>
        <Searchbar type="ingredients" onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">재료 목록</h1>
          <div className="flex space-x-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-4 py-2 rounded ${
                  category === cat.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {isLoading ? (
            <p>로딩 중...</p>
          ) : error ? (
            <p>오류가 발생했습니다.</p>
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
