import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MyIngredients } from './MyIngredients';
import { RecommendedIngredients } from './RecommendedIngredients';
import { RecommendedRecipes } from './RecommendedRecipes';
import {
  useIngredientRecommendations,
  useOldIngredientRecommendations,
  useRecipeRecommendations,
} from '../api/useTasteSuggest';
import { useIsMobile } from '@/shared/hooks/useIsMobile';
import { useMyIngredientsStore } from '@/shared/stores/myIngredientsStore';
import Searchbar from '@/widgets/Searchbar/Searchbar';
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
  const { data: oldRecommendedIngredients } = useOldIngredientRecommendations(
    ingredients.map((i) => i.id)
  );
  const { data: recommendedRecipes } = useRecipeRecommendations(
    ingredients.map((i) => i.id)
  );

  const [searchKeyword, setSearchKeyword] = useState('');
  const [showTip, setShowTip] = useState<string | null>(null);

  const toggleTip = useCallback((tab: string) => {
    setShowTip((prev) => (prev === tab ? null : tab));
  }, []);

  const closeTip = useCallback(() => {
    setShowTip(null);
  }, []);

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
        }, 10000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, isMobile, showAnimation]);

  const handleSuggestItemClick = useCallback(
    (item: { id: number; name: string }) => {
      addIngredient(item.id, item.name);
      setSearchKeyword('');
    },
    [addIngredient]
  );

  const handleAddRecommendedIngredient = useCallback(
    (id: number, name: string) => {
      addIngredient(id, name);
    },
    [addIngredient]
  );

  const handleItemClick = useCallback(() => {
    if (isMobile) {
      onClose();
    }
  }, [isMobile, onClose]);

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
      {activeTab === 'ingredients' && (
        <RecommendedIngredients
          ingredients={recommendedIngredients || []}
          oldIngredients={oldRecommendedIngredients || []}
          onAdd={handleAddRecommendedIngredient}
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
        {tabContent}
      </div>
      {tabBar}
    </div>
  );

  if (!isOpen && isMobile) return null;

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
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{
                  duration: 0.5,
                  ease: [0.19, 1, 0.22, 1],
                }}
                className={`absolute bg-blueberry text-white px-6 py-4 rounded-2xl text-sm max-w-[280px] z-50 shadow-xl ${
                  isMobile ? 'bottom-32 right-4' : 'bottom-16 right-4'
                }`}
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  여기서 식재료와 레시피를
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  추천받을 수 있어요!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  맛있는 요리 여정을 시작해보세요.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
