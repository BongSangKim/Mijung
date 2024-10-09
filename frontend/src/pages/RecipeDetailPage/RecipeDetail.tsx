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

export const RecipeDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: recipe, isLoading, error } = useRecipeDetail(id);
  const [qrCode, setQrCode] = useState<string>('');

  const baseStyles = `relative inline-block pb-2 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-full before:h-px`;
  const dtStyle = 'before:bg-black';
  const ddStyle = 'before:bg-gray-300';

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
          <div className="container mx-auto px-4 my-8 max-w-4xl">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div className="flex-grow">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      {recipe.name || '레시피 이름 없음'}
                    </h1>
                    <p className="text-gray-600 mb-2">
                      {recipe.kind || '종류 미지정'}
                    </p>
                    <div className="flex flex-wrap gap-4">
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
                  <div className="mt-4 md:mt-0">
                    <div className="bg-white shadow-md p-2 w-24 h-24 flex-shrink-0 overflow-hidden">
                      <div
                        className="w-full h-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: qrCode }}
                      />
                    </div>
                  </div>
                </div>
                {recipe.image && (
                  <div className="aspect-w-4 aspect-h-3 mb-6">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  </div>
                )}
                <div className="mb-6">
                  <h2
                    className={`text-xl font-semibold mb-4 ${baseStyles} ${dtStyle}`}
                  >
                    재료
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recipe.materials.length !== 0
                      ? recipe.materials.map((material) => (
                          <li
                            key={material.materialId}
                            className={`flex justify-between items-center ${baseStyles} ${ddStyle}`}
                          >
                            <div className="text-gray-800">{material.name}</div>
                            <div className="text-gray-600">
                              {material.capacity}
                            </div>
                          </li>
                        ))
                      : '재료 정보가 없습니다.'}
                  </ul>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4">조리 순서</h2>
                  {recipe.steps &&
                    recipe.steps.map((step) => (
                      <div
                        key={step.stepId}
                        className="flex flex-col md:flex-row mb-6"
                      >
                        <div
                          className={`w-full ${step.image ? 'md:w-2/3 md:pr-6' : ''} mb-4 md:mb-0`}
                        >
                          <h3 className="font-semibold mb-2">
                            Step {step.stepNumber}
                          </h3>
                          <p>{step.content}</p>
                        </div>
                        {step.image && (
                          <div className="w-full md:w-1/3 aspect-w-4 aspect-h-3">
                            <img
                              src={step.image}
                              alt={`Step ${step.stepId}`}
                              className="object-cover w-full h-full rounded"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </MainLayout>
      <RightSideLayout />
    </div>
  );
};
