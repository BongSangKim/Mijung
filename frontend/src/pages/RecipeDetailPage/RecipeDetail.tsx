import { useState, useEffect, useCallback, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import MainLayout from '../../app/RoutingLayout/MainLayout';
import RightSideLayout from '../../app/RoutingLayout/RightSideLayout';
import { useParams } from 'react-router-dom';
import { useRecipeDetail } from '@/features/recipeList/api/useRecipeDetail';
import { Error } from '@/shared/components';
import { createQRCode } from '@/shared/lib/qrcode';
import { GoPerson } from 'react-icons/go';
import { LuChefHat } from 'react-icons/lu';
import { MdOutlineTimer } from 'react-icons/md';
import { extractTimeInfo } from '@/shared/utils/timeExtractor';
import { toast } from 'react-toastify';
import useSound from 'use-sound';
import { useTimerStore } from '@/shared/stores/timerStore';
import {
  FaClock,
  FaInfoCircle,
  FaHeart,
  FaVolumeUp,
  FaVolumeMute,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { useRecipeStore } from '@/shared/stores/jjimStore';
import { speak, stopSpeaking } from '@/shared/utils/tts';

export const RecipeDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: recipe, isLoading, error } = useRecipeDetail(id);
  const [qrCode, setQrCode] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const { setIsOpen, setDuration, setIsRunning } = useTimerStore();
  const { addRecipe, removeRecipe, isRecipeSaved } = useRecipeStore();

  const [playStart] = useSound('/sounds/timer-start.mp3');

  const [isAudioMode, setIsAudioMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // const [transitionDirection, setTransitionDirection] = useState<
  //   'left' | 'right' | null
  // >(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // const [feedback, setFeedback] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTTSMessage, setShowTTSMessage] = useState(false);
  const speakingAnimationRef = useRef<NodeJS.Timeout | null>(null);
  const ttsMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // const showFeedback = (message: string) => {
  //   setFeedback(message);
  //   if (feedbackTimeoutRef.current) {
  //     clearTimeout(feedbackTimeoutRef.current);
  //   }
  //   feedbackTimeoutRef.current = setTimeout(() => {
  //     setFeedback(null);
  //   }, 1500);
  // };

  // const handleAreaClick = (area: 'left' | 'center' | 'right') => {
  //   if (area === 'left') {
  //     moveToStep('prev');
  //   } else if (area === 'right') {
  //     moveToStep('next');
  //   }
  // };

  const handleDoubleClick = useCallback(() => {
    if (recipe) {
      stopSpeaking();
      setIsSpeaking(true);
      setShowTTSMessage(true);
      speak(recipe.steps[currentStepIndex].content);

      if (speakingAnimationRef.current) {
        clearTimeout(speakingAnimationRef.current);
      }
      speakingAnimationRef.current = setTimeout(() => {
        setIsSpeaking(false);
      }, 500);

      if (ttsMessageTimeoutRef.current) {
        clearTimeout(ttsMessageTimeoutRef.current);
      }
      ttsMessageTimeoutRef.current = setTimeout(() => {
        setShowTTSMessage(false);
      }, 1500);
    }
  }, [recipe, currentStepIndex]);

  const toggleAudioMode = useCallback(() => {
    setIsAudioMode((prev) => {
      if (!prev) {
        setCurrentStepIndex(0);
        if (recipe?.steps[0]) {
          // setTimeout을 사용하여 상태 업데이트 후 speak 함수가 실행되도록 합니다.
          setTimeout(() => {
            speak(recipe.steps[0].content);
          }, 0);
        }
      } else {
        stopSpeaking();
      }
      return !prev;
    });
  }, [recipe]);

  const moveToStep = useCallback(
    (direction: 'next' | 'prev') => {
      if (!recipe) return;
      stopSpeaking();
      // setTransitionDirection(direction === 'next' ? 'left' : 'right');
      setCurrentStepIndex((prevIndex) => {
        let newIndex = direction === 'next' ? prevIndex + 1 : prevIndex - 1;
        if (newIndex < 0) newIndex = recipe.steps.length - 1;
        if (newIndex >= recipe.steps.length) newIndex = 0;

        if (contentRef.current) {
          contentRef.current.style.transition = 'none';
          contentRef.current.style.transform =
            direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';

          setTimeout(() => {
            if (contentRef.current) {
              contentRef.current.style.transition = 'transform 0.3s ease-out';
              contentRef.current.style.transform = 'translateX(0)';
            }
          }, 50);
        }

        setTimeout(() => {
          speak(recipe.steps[newIndex].content);
          // setTransitionDirection(null);
        }, 300);

        return newIndex;
      });
    },
    [recipe]
  );

  const handlers = useSwipeable({
    onSwipedLeft: () => moveToStep('next'),
    onSwipedRight: () => moveToStep('prev'),
    // preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 50, // 스와이프 감지 거리를 늘립니다.
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAudioMode) {
        if (e.key === 'ArrowRight') moveToStep('next');
        if (e.key === 'ArrowLeft') moveToStep('prev');
        if (e.key === 'Escape') toggleAudioMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopSpeaking();
    };
  }, [isAudioMode, moveToStep, toggleAudioMode]);

  useEffect(() => {
    const preventDefaultSwipe = (e: TouchEvent) => {
      if (isAudioMode) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventDefaultSwipe, {
      passive: false,
    });

    return () => {
      document.removeEventListener('touchmove', preventDefaultSwipe);
    };
  }, [isAudioMode]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      if (speakingAnimationRef.current) {
        clearTimeout(speakingAnimationRef.current);
      }
      if (ttsMessageTimeoutRef.current) {
        clearTimeout(ttsMessageTimeoutRef.current);
      }
    };
  }, []);

  const baseStyles = `relative inline-block pb-2 before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-full before:h-px`;
  const dtStyle = 'before:bg-black';
  const ddStyle = 'before:bg-gray-300';

  const [speakingStepId, setSpeakingStepId] = useState<number | null>(null);

  const handleSpeak = (stepId: number, content: string) => {
    if (speakingStepId === stepId) {
      stopSpeaking();
      setSpeakingStepId(null);
    } else {
      stopSpeaking();
      speak(content);
      setSpeakingStepId(stepId);
    }
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

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
                <button
                  onClick={toggleAudioMode}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  <FaVolumeUp className="inline-block mr-2" />
                  소리 듣기 모드
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
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">
                              Step {step.stepNumber}
                            </h3>
                            <button
                              onClick={() =>
                                handleSpeak(step.stepId, step.content)
                              }
                              className="text-blue-600 hover:text-blue-800"
                              aria-label={
                                speakingStepId === step.stepId
                                  ? '음성 중지'
                                  : '음성으로 듣기'
                              }
                            >
                              {speakingStepId === step.stepId ? (
                                <FaVolumeMute size={20} />
                              ) : (
                                <FaVolumeUp size={20} />
                              )}
                            </button>
                          </div>
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
            {isAudioMode && (
              <div
                className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden"
                {...handlers}
              >
                <div className="flex justify-between items-center p-4 bg-gray-100">
                  <h2 className="text-3xl font-bold">
                    Step {recipe.steps[currentStepIndex].stepNumber}
                  </h2>
                  <button
                    onClick={toggleAudioMode}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <FaTimes size={30} />
                  </button>
                </div>
                <div className="flex-grow relative overflow-hidden">
                  <div
                    ref={contentRef}
                    className={`absolute inset-0 flex ${isSpeaking ? 'animate-pulse' : ''}`}
                  >
                    <div
                      className="w-1/6 h-full"
                      onClick={() => moveToStep('prev')}
                    />
                    <div
                      className="w-2/3 h-full flex items-center justify-center"
                      onDoubleClick={handleDoubleClick}
                    >
                      <div className="w-full p-6 relative">
                        <p className="text-3xl leading-relaxed">
                          {recipe.steps[currentStepIndex].content}
                        </p>
                      </div>
                    </div>
                    <div
                      className="w-1/6 h-full"
                      onClick={() => moveToStep('next')}
                    />
                  </div>
                  {recipe.steps[currentStepIndex].image && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <img
                        src={recipe.steps[currentStepIndex].image}
                        alt={`Step ${recipe.steps[currentStepIndex].stepNumber}`}
                        className="max-w-full max-h-full object-contain opacity-10"
                      />
                    </div>
                  )}
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FaChevronLeft size={36} />
                  </div>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FaChevronRight size={36} />
                  </div>
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-gray-400 pointer-events-none">
                    <FaVolumeUp size={36} />
                  </div>
                  {showTTSMessage && (
                    <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded text-2xl">
                      다시 들려드릴게요. 맛있는 요리 하세요!
                    </div>
                  )}
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
