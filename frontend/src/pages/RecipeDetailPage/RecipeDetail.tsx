import LeftSideLayout from '../../app/RoutingLayout/LeftSideLayout';
import MainLayout from '../../app/RoutingLayout/MainLayout';
import RightSideLayout from '../../app/RoutingLayout/RightSideLayout';
import { useParams } from 'react-router-dom';
import { useRecipeDetail } from '@/features/recipeList/api/useRecipeDetail';
import { Error } from '@/shared/components';

export const RecipeDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: recipe, isLoading, error } = useRecipeDetail(id);

  if (error) return <Error />;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-10">
      <LeftSideLayout />
      <MainLayout>
        {recipe && (
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{recipe.name}</h1>
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">재료</h2>
              <ul className="list-disc list-inside text-gray-700 mb-6">
                {recipe.materials?.map((material, index) => (
                  <li key={index}>{material.name}</li>
                ))}
              </ul>

              <h2 className="text-2xl font-semibold mb-4">조리 방법</h2>
              <ol className="list-decimal list-inside text-gray-700 mb-6">
                {recipe.steps?.map((step, index) => (
                  <li key={index}>{step.content}</li>
                ))}
              </ol>

              <div className="flex justify-between text-gray-600">
                <p>조리 시간: {recipe.time}</p>
                <p>난이도: {recipe.level}</p>
              </div>
            </div>
          </div>
        )}
      </MainLayout>
      <RightSideLayout />
    </div>
  );
};
