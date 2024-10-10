import axios, { AxiosResponse } from 'axios';
import {
  IngredientResponse,
  IngredientSiseRequest,
  IngredientSiseResponse,
  IngredientInfo,
  IngredientCosineResponse,
  RecommendedRecipe,
  IngredientPrediction,
} from './ingredientTypes';

// 실제 API와 통신하는 클라이언트 클래스
const baseURL = import.meta.env.VITE_APP_PRODUCT_URL;

export default class IngredientClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_APP_PRODUCT_URL;
  }

  // 재료 목록을 가져오는 메서드
  async getIngredients(params: {
    page?: number;
    perPage?: number;
    category?: string;
  }) {
    return axios.get<IngredientResponse>(`${this.baseURL}/ingredients/search`, {
      params,
    });
  }
  // 메인페이지 재료 가격 추이 데이터 가져오는 메서드
  async getIngredientSise(
    params: IngredientSiseRequest
  ): Promise<AxiosResponse<IngredientSiseResponse>> {
    return axios.get<IngredientSiseResponse>(`${baseURL}/ingredients/price`, {
      params,
    });
  }

  async getIngredientInfo(
    ingredientId: number
  ): Promise<AxiosResponse<{ data: IngredientInfo }>> {
    return axios.get<{ data: IngredientInfo }>(
      `${this.baseURL}/ingredients/${ingredientId}/info`
    );
  }

  async getIngredientAutoComplete(search: string) {
    const endpoint = `${this.baseURL}/ingredients/search/${search}`;
    console.log('API 요청 엔드포인트:', endpoint);
    return axios.get(endpoint);
  }

  // 네트워크 그래프 데이터를 가져오는 메서드 추가
  async getNetworkGraphData(
    ingredientId: number
  ): Promise<AxiosResponse<{ data: IngredientCosineResponse[] }>> {
    return axios.get<{ data: IngredientCosineResponse[] }>(
      `${this.baseURL}/ingredients/${ingredientId}/network-graph`
    );
  }

  async searchIngredients(params: {
    category: string;
    page: number;
    perPage: number;
    keyword: string | null;
  }) {
    return axios.get(`${this.baseURL}/ingredients/search`, { params });
  }

  // 추천 레시피를 가져오는 메서드 추가
  async getIngredientRecommendRecipes(
    ingredientId: number
  ): Promise<AxiosResponse<RecommendedRecipe[]>> {
    return axios.get<RecommendedRecipe[]>(
      `${this.baseURL}/ingredients/${ingredientId}/recommend-recipes`
    );
  }

  async getIngredientPredictions(
    ingredientId: number
  ): Promise<AxiosResponse<{ data: IngredientPrediction[] }>> {
    console.log(`Fetching predictions for ingredient ID: ${ingredientId}`);
    return axios.get<{ data: IngredientPrediction[] }>(
      `${this.baseURL}/ingredients/${ingredientId}/price-graph`
    );
  }
}
