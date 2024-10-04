import RecipeApi from '../api/recipe';
import FakeRecipeClient from '@/shared/api/fakeRecipeClient';
import RecipeClient from '@/shared/api/recipeClient';

const client =
  window.location.hostname === 'localhost'
    ? new FakeRecipeClient()
    : new RecipeClient();

export const recipeApi = new RecipeApi(client);
