import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Recipe } from '@/shared/api/recipeTypes';
import { toast } from 'react-toastify';
import { checkKoreanIga } from '@/shared/utils/checkKorean';

interface RecipeStore {
  savedRecipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (recipeId: number) => void;
  isRecipeSaved: (recipeId: number) => boolean;
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      savedRecipes: [],
      addRecipe: (recipe) => {
        set((state) => ({
          savedRecipes: [...state.savedRecipes, recipe],
        }));
        toast.success(
          `${recipe.name}${checkKoreanIga(recipe.name)} 찜 목록에 추가되었습니다.`
        );
      },
      removeRecipe: (recipeId) => {
        const removedRecipe = get().savedRecipes.find(
          (r) => r.recipeId === recipeId
        );
        set((state) => ({
          savedRecipes: state.savedRecipes.filter(
            (r) => r.recipeId !== recipeId
          ),
        }));
        if (removedRecipe) {
          toast.info(
            `${removedRecipe.name}${checkKoreanIga(removedRecipe.name)} 찜 목록에서 제거되었습니다.`
          );
        }
      },
      isRecipeSaved: (recipeId) =>
        get().savedRecipes.some((r) => r.recipeId === recipeId),
    }),
    {
      name: 'recipe-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
