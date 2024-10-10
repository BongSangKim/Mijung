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
    (id: number, name: string) => {
      addIngredient(id, name);
      setSearchKeyword('');
    },
    [addIngredient]
  );

  const handleItemClick = useCallback(() => {
    if (isMobile) {
      onClose();
    }
  }, [isMobile, onClose]);

  const tabBar = (
    <div className="flex border-t border-gray-200">
      <button
        className={`flex-1 py-2 px-4 text-sm font-medium ${
          activeTab === 'ingredients'
            ? 'text-mint border-t-2 border-mint'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('ingredients')}
      >
        추천 식재료
      </button>
      <button
        className={`flex-1 py-2 px-4 text-sm font-medium ${
          activeTab === 'recipes'
            ? 'text-mint border-t-2 border-mint'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('recipes')}
      >
        추천 레시피
      </button>
    </div>
  );

  const content = (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold mb-4 text-blueberry">
          나만의 요리 도우미
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes size={24} />
        </button>
      </div>
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
      {activeTab === 'ingredients' && (
        <RecommendedIngredients
          ingredients={recommendedIngredients || []}
          oldIngredients={oldRecommendedIngredients || []}
          onAdd={handleSuggestItemClick}
          onItemClick={handleItemClick}
        />
      )}
      {activeTab === 'recipes' && (
        <RecommendedRecipes
          recipes={recommendedRecipes}
          onItemClick={handleItemClick}
        />
      )}
    </div>
  );

  if (!isOpen && isMobile) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
          className={`fixed bg-background shadow-lg flex flex-col z-40 ${
            isMobile
              ? 'inset-0 bottom-16'
              : 'top-16 right-0 w-full lg:w-[30%] h-[calc(100vh-4rem)]'
          }`}
        >
          <div className="flex-grow overflow-y-auto">{content}</div>
          {!isMobile && tabBar}
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
