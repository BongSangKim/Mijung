import create from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-toastify';
import { checkKoreanIga } from '@/shared/utils/checkKorean';

interface Ingredient {
  id: number;
  name: string;
}

interface MyIngredientsState {
  ingredients: Ingredient[];
  addIngredient: (id: number, name: string) => void;
  removeIngredient: (id: number) => void;
  clearIngredients: () => void;
}

export const useMyIngredientsStore = create<MyIngredientsState>()(
  persist(
    (set) => ({
      ingredients: [],
      addIngredient: (id: number, name: string) =>
        set((state) => {
          if (!state.ingredients.some((i) => i.id === id)) {
            toast.success(
              `${name}${checkKoreanIga(name)} 추천 창에 추가되었습니다.`
            );
            return { ingredients: [...state.ingredients, { id, name }] };
          }
          return state;
        }),
      removeIngredient: (id: number) =>
        set((state) => {
          const removedIngredient = state.ingredients.find((i) => i.id === id);
          if (removedIngredient) {
            toast.info(
              `${removedIngredient.name}${checkKoreanIga(removedIngredient.name)} 추천 창에서 제거되었습니다.`
            );
          }
          return { ingredients: state.ingredients.filter((i) => i.id !== id) };
        }),
      clearIngredients: () => {
        set({ ingredients: [] });
        toast.info('모든 재료가 추천 창에서 제거되었습니다.');
      },
    }),
    {
      name: 'my-ingredients-storage',
    }
  )
);
