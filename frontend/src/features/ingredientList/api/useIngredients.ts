// 데이터 fetching을 위한 React Query 훅
import { useQuery } from '@tanstack/react-query';
import { ingredientApi } from '../../../entities/ingredient/model/ingredientApi';

export const useIngredients = (page: number = 1, perPage: number = 10) => {
  return useQuery({
    queryKey: ['ingredient', page, perPage],
    queryFn: () => ingredientApi.getIngredients(page, perPage),
  });
};