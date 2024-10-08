// ingredient 데이터 타입 정의

export interface Ingredient {
  ingredientId: number;
  name: string;
  retailUnit: string;
  retailUnitsize: string;
  image: string;
  price: string;
  changeRate: number;
  changePrice: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  perPage: number;
}

export interface IngredientResponse {
  data: Ingredient[];
  pagination: PaginationInfo;
}

export interface IngredientSiseRequest {
  period: 'year' | 'month' | 'week';
  change: 'positive' | 'negative';
  count: number;
}

export interface IngredientSise {
  ingredientId: number;
  name: string;
  retailUnit: string;
  retailUnitsize: string;
  image: string;
  price: string;
  changeRate: number;
  changePrice: number;
}

export interface IngredientSiseResponse {
  data: IngredientSise[];
}

export interface IngredientInfo {
  ingredientId: number;
  name: string;
  retailUnit: string;
  retailUnitsize: string;
  image: string;
  price: string;
  changeRate: number;
  changePrice: number;
  colorHex?: string; // 아직 옵셔널로 둡니다
}

export interface IngredientCosineResponse {
  ingredientId: number;
  ingredientId2: number;
  itemName: string;
  cosine: number; // 코사인 유사도
}
