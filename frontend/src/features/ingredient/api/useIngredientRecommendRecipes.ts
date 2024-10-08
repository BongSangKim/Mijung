import { useQuery } from '@tanstack/react-query';
import { ingredientApi } from '../../../entities/ingredient/model/ingredientApi';

export interface RecommendedRecipe {
  recipeId: number;
  name: string;
  kind: string;
  image: string;
}

export interface IngredientRecommendRecipeResponse {
  data: RecommendedRecipe[];
}

export const useIngredientRecommendRecipes = (ingredientId: number) => {
  return useQuery<IngredientRecommendRecipeResponse, Error>({
    queryKey: ['ingredientRecommendRecipes', ingredientId],
    queryFn: async () => {
      const response =
        await ingredientApi.getIngredientRecommendRecipes(ingredientId);
      if (Array.isArray(response)) {
        return { data: response };
      }
      return response;
    },
    enabled: !!ingredientId,
  });
};
