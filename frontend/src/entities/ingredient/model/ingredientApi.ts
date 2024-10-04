import IngredientApi from '../api/ingredient';
import FakeIngredientClient from '../../../shared/api/fakeIngredientClient';
import IngredientClient from '../../../shared/api/ingredientClient';

// 환경에 따라 적절한 클라이언트를 선택하여 IngredientApi 인스턴스 생성
const client =
  window.location.hostname === 'localhost'
    ? new FakeIngredientClient()
    : new IngredientClient();

export const ingredientApi = new IngredientApi(client);
