import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Recipe } from '@/shared/api/recipeTypes';

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
      addRecipe: (recipe) =>
        set((state) => ({
          savedRecipes: [...state.savedRecipes, recipe],
        })),
      removeRecipe: (recipeId) =>
        set((state) => ({
          savedRecipes: state.savedRecipes.filter(
            (r) => r.recipeId !== recipeId
          ),
        })),
      isRecipeSaved: (recipeId) =>
        get().savedRecipes.some((r) => r.recipeId === recipeId),
    }),
    {
      name: 'recipe-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
