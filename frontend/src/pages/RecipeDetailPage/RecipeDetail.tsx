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
import { extractTimeInfo } from '@/shared/utils/timeExtractor';
import Timer from '@/shared/components/Timer';
import { toast } from 'react-toastify';
import useSound from 'use-sound';
import { useTimerStore } from '@/shared/stores/timerStore';
import { FaClock, FaInfoCircle, FaHeart } from 'react-icons/fa';
import timerStartSound from '@sound/timer-start';
import { useRecipeStore } from '@/shared/stores/jjimStore';

export const RecipeDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: recipe, isLoading, error } = useRecipeDetail(id);
  const [qrCode, setQrCode] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const { setIsOpen, setDuration, setIsRunning } = useTimerStore();
  const { addRecipe, removeRecipe, isRecipeSaved } = useRecipeStore();

  const [playStart] = useSound('/sounds/timer-start.mp3');

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
      const logoUrl = '/icons/android-chrome-192x192.png';
      createQRCode(url, params, logoUrl).then(setQrCode);
    }
  }, [recipe]);

  const handleTimeClick = (minutes: number) => {
    setDuration(minutes * 60);
    setIsOpen(true);
    setIsRunning(true);
    playStart();
    toast.success(`${minutes}분 타이머가 시작되었습니다!`);
  };

  const handleOpenTimer = () => {
    setIsOpen(true);
  };

  const handleOpenExplanation = () => {
    setShowExplanation(true);
  };

  const handleToggleJjim = () => {
    if (recipe) {
      if (isRecipeSaved(recipe.recipeId)) {
        removeRecipe(recipe.recipeId);
      } else {
        addRecipe(recipe);
      }
    }
  };

  if (error) return <Error />;
  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="grid grid-cols-10">
      <MainLayout>
        {recipe && (
          <div className="container mx-auto px-4 my-8 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold">{recipe.name}</h1>
                <button
                  onClick={handleToggleJjim}
                  className={`p-2 rounded-full transition-colors ${
                    isRecipeSaved(recipe.recipeId)
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-gray-400 hover:text-gray-500'
                  }`}
                  aria-label={
                    isRecipeSaved(recipe.recipeId) ? '찜 해제' : '찜하기'
                  }
                >
                  <FaHeart size={24} />
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleOpenTimer}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  <FaClock className="inline-block mr-2" />
                  타이머 설정
                </button>
                <button
                  onClick={handleOpenExplanation}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                  <FaInfoCircle className="inline-block mr-2" />
                  타이머 설명
                </button>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div className="flex-grow">
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
                            <a
                              href={`/ingredients/${material.ingredientId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center hover:text-blue-600 transition-colors duration-200"
                              aria-label={`${material.name} 상세 정보 (새 창에서 열림)`}
                            >
                              <div className="hover:text-blue-600 transition-colors duration-200 text-gray-800">
                                {material.name}
                              </div>
                            </a>
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
                          <p>
                            {step.content.split(' ').map((word, index) => {
                              const timeInfo = extractTimeInfo(word);
                              if (timeInfo) {
                                return (
                                  <button
                                    key={index}
                                    onClick={() =>
                                      handleTimeClick(timeInfo.minutes)
                                    }
                                    className="text-blue-600 hover:underline"
                                  >
                                    {word}
                                  </button>
                                );
                              }
                              return ` ${word} `;
                            })}
                          </p>
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
            {showExplanation && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md">
                  <h2 className="text-xl font-bold mb-4">타이머 사용 안내</h2>
                  <ul className="list-disc list-inside">
                    <li>
                      레시피 내 시간 정보(예: 30분, 1시간 등)를 클릭하시면
                      자동으로 타이머가 설정됩니다.
                    </li>
                    <li>타이머는 원하는 위치로 드래그하여 이동할 수 있어요.</li>
                    <li>
                      일시정지와 재생 기능을 자유롭게 사용하실 수 있습니다.
                    </li>
                    <li>타이머가 종료되면 알람이 울립니다.</li>
                    <li>15초 이하로 남으면 초읽기 소리가 나요.</li>
                    <li>다른 페이지로 이동해도 타이머는 계속 작동합니다.</li>
                  </ul>
                  <button
                    onClick={() => setShowExplanation(false)}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    닫기
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </MainLayout>
      <RightSideLayout />
    </div>
  );
};
