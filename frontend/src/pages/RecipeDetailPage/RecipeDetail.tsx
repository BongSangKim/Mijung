import MainLayout from '../../app/RoutingLayout/MainLayout';
import RightSideLayout from '../../app/RoutingLayout/RightSideLayout';
import { useParams } from 'react-router-dom';
import { useRecipeDetail } from '@/features/recipeList/api/useRecipeDetail';
import { Error } from '@/shared/components';
import { createQRCode } from '@/shared/lib/qrcode';
import { useEffect, useState } from 'react';
import { GoPerson } from 'react-icons/go';
import { LuChefHat } from 'react-icons/lu';
import { MdOutlineTimer } from 'react-icons/md';
import { defaultRecipeImg } from '@/shared/url/defualtImage';

export const RecipeDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: recipe, isLoading, error } = useRecipeDetail(id);
  const [qrCode, setQrCode] = useState<string>('');

  // Create QR Box
  useEffect(() => {
    if (recipe) {
      const url = `https://mijung.store/recipes/${recipe.recipeId}`;
      const params = {
        Margin: 2,
        Background: '#ffffff',
        Finder: '#131d87',
        Horizontal: '#dc9c07',
        Vertical: '#d21313',
        Cross: '#131d87',
        'Horizontal thickness': 0.7,
        'Vertical thickness': 0.7,
        'Cross thickness': 0.7,
      };
      const logoUrl = '/icons/android-chrome-192x192.png'; // 로고 이미지 경로 지정
      createQRCode(url, params, logoUrl).then(setQrCode);
    }
  }, [recipe]);

  if (error) return <Error />;
  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="grid grid-cols-10">
      <MainLayout>
        {recipe && (
          <div className="container mx-4 my-8 relative">
            {/* Recipe Title start */}
            <h1 className="text-3xl font-bold mb-4">
              {recipe.name || '레시피 이름 없음'}
            </h1>
            {/* Recipe Title end */}

            {/* Recipe Info start */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">
                  {recipe.kind || '종류 미지정'}
                </span>
                <div className="flex space-x-4">
                  <span className="flex items-center">
                    <GoPerson className="mr-1" size={16} />{' '}
                    {recipe.inbun || '인분 정보 없음'}
                  </span>
                  <span className="flex items-center">
                    <LuChefHat className="mr-1" size={16} />{' '}
                    {recipe.level || '난이도 정보 없음'}
                  </span>
                  <span className="flex items-center">
                    <MdOutlineTimer className="mr-1" size={16} />{' '}
                    {recipe.time || '시간 정보 없음'}
                  </span>
                </div>
              </div>
            </div>
            {/* Recipe INfo end */}

            <img
              src={recipe.image || defaultRecipeImg}
              alt={recipe.name}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />

            {/* Recipe materials start */}
            <div className="bg-white rounded-lg shadow-md mb-4 p-4">
              <h2 className="text-xl font-semibold mb-2">재료</h2>
              <div className="grid grid-cols-2 gap-24">
                {recipe.materials &&
                  recipe.materials.map((material) => (
                    <div
                      key={material.materialId}
                      className="flex justify-between"
                    >
                      <span>{material.name}</span>
                      <span className="text-gray-600">{material.capacity}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md mb-4 p-4">
              <h2 className="text-xl font-semibold mb-2">기타 재료 및 도구</h2>
              <div className="grid grid-cols-2 gap-24">
                {recipe.etc &&
                  recipe.etc.map((item) => (
                    <div key={item.etcId} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="text-gray-600">{item.capacity}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold mb-2">조리 순서</h2>
              {recipe.steps &&
                recipe.steps.map((step) => (
                  <div key={step.stepId} className="mb-4">
                    <h3 className="font-semibold mb-2">
                      Step {step.stepNumber}
                    </h3>
                    <p>{step.content}</p>
                    {step.image && (
                      <img
                        src={step.image}
                        alt={`Step ${step.stepId}`}
                        className="mt-2 w-full h-40 object-cover rounded"
                      />
                    )}
                  </div>
                ))}
            </div>
            {/* Recipe materials end */}

            {/* QR Box Start */}
            <div className="absolute top-0 right-0 bg-white shadow-md rounded-lg p-2 w-24 h-24 flex-shrink-0 overflow-hidden">
              <div
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: qrCode }}
              />
            </div>
            {/* QR Box End */}
          </div>
        )}
      </MainLayout>
      <RightSideLayout />
    </div>
  );
};
