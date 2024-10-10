import axios from 'axios';

const ingredientBaseURL = import.meta.env.VITE_PROD_INGREDIENT_API_URL;
const fastApiBaseURL = import.meta.env.VITE_PROD_FAST_API_URL;
const recipeBaseURL = import.meta.env.VITE_PROD_FAST_API_URL;

export default class TasteSuggestClient {
  async getRecommendedIngredients(ingredients: number[]) {
    console.log('추천 재료 API 호출 중...');
    console.log('요청:', { ingredients, count: 5 });

    // 변경된 부분: 파라미터를 객체로 직접 전달
    const response = await axios.get(
      `${ingredientBaseURL}/carts/recommends/ingredients`,
      {
        params: {
          ingredients: ingredients,
          count: 5,
        },
        paramsSerializer: (params) => {
          return Object.entries(params)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return value.map((v) => `${key}=${v}`).join('&');
              }
              return `${key}=${value}`;
            })
            .join('&');
        },
      }
    );

    console.log('응답:', response.data);
    console.log('새 추천 재료 API 호출 완료');
    return response;
  }

  async getOldRecommendedIngredients(ingredients: number[]) {
    console.log('이전 추천 재료 API 호출 중...');
    const params = new URLSearchParams();
    ingredients.forEach((id) => params.append('ingredients', id.toString()));
    params.append('count', '5');
    const response = await axios.get(
      `${fastApiBaseURL}/carts/recommends/ingredients?${params.toString()}`
    );
    console.log('이전 추천 재료 API 호출 완료');
    return response;
  }

  async getRecommendedRecipes(ingredients: number[]) {
    console.log('추천 레시피 API 호출 중...');
    console.log('요청:', { ingredients, count: 4 });
    const params = new URLSearchParams();
    ingredients.forEach((id) => params.append('ingredients', id.toString()));
    params.append('count', '4');
    const response = await axios.get(
      `${recipeBaseURL}/carts/recommends/recipes?${params.toString()}`
    );
    console.log('응답:', response.data);
    console.log('추천 레시피 API 호출 완료');
    return response;
  }
}
