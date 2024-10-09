import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MyIngredients } from './MyIngredients';
import { RecommendedIngredients } from './RecommendedIngredients';
import { RecommendedRecipes } from './RecommendedRecipes';
import {
  useIngredientRecommendations,
  useRecipeRecommendations,
} from '../api/useTasteSuggest';
import { useIsMobile } from '@/shared/hooks/useIsMobile';
import { useMyIngredientsStore } from '@/shared/stores/myIngredientsStore';
import Searchbar from '@/widgets/Searchbar/Searchbar';
import { checkKoreanIga } from '@/shared/utils/checkKorean';
import { FaTimes } from 'react-icons/fa';

interface TasteSuggestProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TasteSuggest = ({ isOpen, onClose }: TasteSuggestProps) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'recipes'>(
    'ingredients'
  );
  const [showAnimation, setShowAnimation] = useState(false);
  const isMobile = useIsMobile();

  const { ingredients, addIngredient, removeIngredient, clearIngredients } =
    useMyIngredientsStore();

  const { data: recommendedIngredients } = useIngredientRecommendations(
    ingredients.map((i) => i.id)
  );
  const { data: recommendedRecipes } = useRecipeRecommendations(
    ingredients.map((i) => i.id)
  );

  const [searchKeyword, setSearchKeyword] = useState('');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'add' | 'remove' | 'clear';
  } | null>(null);
  const [showTip, setShowTip] = useState<string | null>(null);

  const toggleTip = (tab: string) => {
    setShowTip(tab === showTip ? null : tab);
  };

  const closeTip = () => {
    setShowTip(null);
  };

  useEffect(() => {
    const unsubscribe = useMyIngredientsStore.subscribe((state, prevState) => {
      if (state.ingredients.length > prevState.ingredients.length) {
        const newIngredient = state.ingredients[state.ingredients.length - 1];
        setNotification({
          message: `${newIngredient.name}${checkKoreanIga(newIngredient.name)} 추가되었습니다.`,
          type: 'add',
        });
      } else if (state.ingredients.length < prevState.ingredients.length) {
        const removedIngredient = prevState.ingredients.find(
          (ing) => !state.ingredients.some((newIng) => newIng.id === ing.id)
        );
        if (removedIngredient) {
          setNotification({
            message: `${removedIngredient.name}${checkKoreanIga(removedIngredient.name)} 제거되었습니다.`,
            type: 'remove',
          });
        }
      } else if (
        state.ingredients.length === 0 &&
        prevState.ingredients.length > 0
      ) {
        setNotification({
          message: '모든 재료가 삭제되었습니다.',
          type: 'clear',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const hasSeenNotification = sessionStorage.getItem(
      'tasteSuggestNotificationSeen'
    );

    if (!hasSeenNotification) {
      if (isMobile && isOpen) {
        setShowAnimation(true);
      } else if (!isMobile) {
        setShowAnimation(true);
      }

      if (showAnimation) {
        const timer = setTimeout(() => {
          setShowAnimation(false);
          sessionStorage.setItem('tasteSuggestNotificationSeen', 'true');
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, isMobile, showAnimation]);

  if (!isOpen && isMobile) return null;

  const handleSuggestItemClick = (item: { id: number; name: string }) => {
    addIngredient(item.id, item.name);
    setSearchKeyword(''); // 검색어 초기화
  };

  const handleItemClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  const tabContent = (
    <div className="flex-grow overflow-auto">
      {showTip === 'ingredients' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-4 relative">
          <button
            onClick={closeTip}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes />
          </button>
          <p className="text-sm text-gray-600 pr-6">
            이 추천은 연관 규칙 마이닝 기반의 장바구니 분석 알고리즘을 사용해요.
            레시피 빅데이터를 통해 식재료 간의 연관성을 파악하고, 지지도와
            신뢰도를 계산하여 가장 관련성 높은 식재료를 제안해드려요. 🛒✨
          </p>
        </div>
      )}
      {showTip === 'recipes' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-4 relative">
          <button
            onClick={closeTip}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes />
          </button>
          <p className="text-sm text-gray-600 pr-6">
            이 추천은 선택한 식재료들의 코사인 유사도 벡터를 활용해요. 각
            식재료의 벡터값을 조합하여 복합적인 유사도를 계산하고, 이를 바탕으로
            가장 적합한 레시피를 찾아내요. 🍳🧮
          </p>
        </div>
      )}
      {activeTab === 'ingredients' && recommendedIngredients && (
        <RecommendedIngredients
          ingredients={recommendedIngredients}
          onAdd={addIngredient}
          onItemClick={handleItemClick}
        />
      )}
      {activeTab === 'recipes' && recommendedRecipes && (
        <RecommendedRecipes
          recipes={recommendedRecipes}
          onItemClick={handleItemClick}
        />
      )}
    </div>
  );

  const tabBar = (
    <div className="flex justify-around items-center bg-gradient-to-b from-gray-100 to-gray-200 border-t border-gray-300 p-3 rounded-t-2xl shadow-lg">
      <button
        onClick={() => {
          setActiveTab('ingredients');
          toggleTip('ingredients');
        }}
        className={`flex-1 py-2 px-4 text-center relative rounded-lg transition-all duration-300 ${
          activeTab === 'ingredients'
            ? 'bg-mint text-white font-bold shadow-md'
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        }`}
      >
        식재료 추천받기
      </button>
      <div className="w-px h-8 bg-gray-400 mx-2"></div>
      <button
        onClick={() => {
          setActiveTab('recipes');
          toggleTip('recipes');
        }}
        className={`flex-1 py-2 px-4 text-center relative rounded-lg transition-all duration-300 ${
          activeTab === 'recipes'
            ? 'bg-mint text-white font-bold shadow-md'
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        }`}
      >
        레시피 추천받기
      </button>
    </div>
  );

  const content = (
    <div className="flex flex-col h-full">
      <div className="p-6 flex-grow overflow-y-auto">
        <h2 className="text-3xl font-bold mb-4 text-blueberry">
          나만의 요리 도우미
        </h2>
        {/* <p className="text-text-light mb-4">
          가지고 있는 재료나 사고 싶은 재료를 추가해보세요
        </p> */}
        <Searchbar
          type="ingredients"
          onSearch={() => {}}
          isSuggestSearch={true}
          onSuggestItemClick={handleSuggestItemClick}
          value={searchKeyword}
          onChange={setSearchKeyword}
        />
        <MyIngredients
          ingredients={ingredients}
          onRemove={removeIngredient}
          onClear={clearIngredients}
        />
        {notification && (
          <div
            className={`mt-2 font-semibold ${
              notification.type === 'add'
                ? 'text-green-600'
                : notification.type === 'remove'
                  ? 'text-red-600'
                  : 'text-yellow-600'
            }`}
          >
            {notification.message}
          </div>
        )}
        {tabContent}
      </div>
      {tabBar}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: isMobile ? '100%' : 0, x: isMobile ? 0 : '100%' }}
          animate={{ y: 0, x: 0 }}
          exit={{ y: isMobile ? '100%' : 0, x: isMobile ? 0 : '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed bg-background shadow-lg flex flex-col z-40 ${
            isMobile
              ? 'inset-0 bottom-16'
              : 'top-16 right-0 w-full lg:w-[30%] h-[calc(100vh-4rem)]'
          }`}
        >
          <div className="flex-grow overflow-y-auto">{content}</div>
          <AnimatePresence>
            {showAnimation && (
              <motion.div
                initial={{ opacity: 0, y: 20, x: '100%' }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: 20, x: '100%' }}
                transition={{ duration: 0.5 }}
                className={`absolute bg-blueberry text-white px-4 py-2 rounded-lg text-sm max-w-[200px] z-50 ${
                  isMobile ? 'bottom-20 right-4' : 'bottom-4 right-4'
                }`}
              >
                여기에서 식재료/레시피를 추천받을 수 있어요!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
