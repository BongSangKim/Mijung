# recommend.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from pyspark.sql.functions import col, count, when
import numpy as np
import logging

from requests import Session
from app.common.dto.responsedto import ResponseDTO
from app.databases import database
from app.error.GlobalExceptionHandler import IngredientMessage
from app.models.models import get_embedding_model, get_recipe_model, get_exploded_df
from app.schemas.ingredient import Ingredient, IngredientRecommandRequest, RecipeItem, RecipeRecommendRequest, RecommendIngredientListResponse
from app.schemas.recipe import Recipe, RecipeRead
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
router = APIRouter(
    tags=['carts'],
    responses={404: {"description": "Not found"}}
)

def find_similar_recipes(recipe_vector, threshold=0.7):
    recipe_model = get_recipe_model()
    similar_words_recipe = recipe_model.similar_by_vector(recipe_vector, topn=300)
    
    if isinstance(similar_words_recipe, list):
        filtered_keys = [word for word, similarity in similar_words_recipe if similarity >= threshold]
    else:
        logging.error("Unexpected structure returned from similar_by_vector")
        filtered_keys = []
    
    return filtered_keys

def find_top_6_common_rcp_sno(ingredient, nearby_recipe_keys, cnt):
    exploded_df = get_exploded_df()
    filtered_df = exploded_df.filter(col("RCP_SNO").isin(nearby_recipe_keys))
    
    result_df = filtered_df.groupBy("RCP_SNO").agg(
        count(when(col("Number").isin(ingredient), 1)).alias("count")
    )
    
    top_6_rcp_sno = result_df.orderBy(col("count").desc()).limit(cnt).collect()
    return [(row['RCP_SNO'], row['count']) for row in top_6_rcp_sno]


# 코사인 유사도
def find_similar_ingredients(embedding_model, recipe_vector, cnt):
    """
    embedding_model과 recipe_vector 간의 코사인 유사도를 계산하여
    가장 유사도가 높은 ingredients를 반환합니다.
    
    Args:
        embedding_model: Word2Vec 모델
        recipe_vector: 레시피의 평균 벡터
        cnt: 반환할 상위 결과의 개수
    
    Returns:
        List of tuples: (ingredient_key, similarity_score)
    """
    try:
        # Word2Vec 모델의 most_similar 메서드를 사용하여 코사인 유사도 계산
        similar_ingredients = embedding_model.wv.similar_by_vector(
            recipe_vector,
            topn=cnt*3
        )
        
        # 결과 로깅
        logging.info(f"Found {len(similar_ingredients)} similar ingredients")
        for ing, score in similar_ingredients:  # 상위 5개만 로깅
            logging.debug(f"Ingredient: {ing}, Similarity: {score:.4f}")
        
        return similar_ingredients
    
    except Exception as e:
        logging.error(f"Error finding similar ingredients: {str(e)}")
        raise


def find_cosine_similarity(recipe_vector, cnt):
    recipe_model = get_recipe_model()
    similar_words_recipe = recipe_model.similar_by_vector(recipe_vector, topn=cnt)
    
    if isinstance(similar_words_recipe, list):
        filtered_keys = [word for word, similarity in similar_words_recipe]
    else:
        logging.error("Unexpected structure returned from similar_by_vector")
        filtered_keys = []
    
    return filtered_keys

def find_cosine_similarity_ingredients(embedding, cnt, ingredientsIdx):
    ingredient = get_embedding_model()
    print("Word2Vec 객체:", type(ingredient), ingredient)

    similar_ingredient = ingredient.wv.most_similar(embedding)
    filtered_keys =[]
    
    if isinstance(similar_ingredient, list):
        for word, similarity in similar_ingredient:  # word, similarity로 언팩
            if len(filtered_keys) == cnt:
                break
            if word in ingredientsIdx:  # ingredientsIdx에 있는 경우를 건너띄게 하는 조건
                continue
            filtered_keys.append(word)  # ingredientsIdx에 없는 경우에만 추가
        logging.info(f"현재 ingredient 리턴 {filtered_keys}")    
    else:
        logging.error("Unexpected structure returned from similar_by_vector")
        filtered_keys = []
    
    return filtered_keys

    

@router.get("/carts/recommends/recipes", response_model=ResponseDTO)
async def getRecipeRecommend(
    request: RecipeRecommendRequest = Query(...),
):
    try:
        db_engine = database.engineconn()
        db_session = db_engine.get_session()
        ingredients = request.ingredients
        count = request.count

        embedding_model = get_embedding_model()
        embeddings = []
        
        for ing in ingredients:
            if ing in embedding_model.wv.key_to_index:
                embeddings.append(embedding_model.wv[ing].tolist())
            else:
                logging.warning(f"Ingredient {ing} not found in embeddings, skipping.")
        
        if not embeddings:
            raise HTTPException(status_code=400, detail=IngredientMessage.INGREDIENT_NOT_FOUND)

        recipe_vector = np.mean(embeddings, axis=0)
        #nearby_recipe_keys = find_similar_recipes(recipe_vector, threshold=0.8)
        
        #logging.info("Recipe 모델에서 유사도가 0.7 이상인 레시피 키: %s", nearby_recipe_keys)
        
        #top_6_rcp_sno = find_top_6_common_rcp_sno(ingredients, nearby_recipe_keys, cnt=count)
        top_6_rcp_sno = find_cosine_similarity(recipe_vector, cnt= count)
        try:
            recipes = db_session.query(Recipe).filter(Recipe.recipe_id.in_(top_6_rcp_sno)).all()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
        recipes = db_session.query(Recipe).filter(Recipe.recipe_id.in_(top_6_rcp_sno)).all()
        
        result = [
            RecipeItem(
            recipeId=recipe.recipe_id,
            name=recipe.name,
            kind=recipe.kind,
            image=recipe.image.strip()  # Strip unwanted characters from image URLs
        ) for recipe in recipes
        ]
        
        return ResponseDTO.from_(data=result)

    except (IntegrityError, SQLAlchemyError) as e:
       logging.error(f"Database error occurred: {e}")  # 두 에러를 한 번의 메시지 출력으로 통합

    except Exception as e:
        raise

    finally:
        db_session.close()  # 세션을 닫습니다.

    

@router.get("/carts/recommends/ingredients", response_model=ResponseDTO)
async def getIngredientRecommend(
    request: IngredientRecommandRequest = Query(...),
):
    embedding_model = get_embedding_model()
    embeddings = []
    try:
        db_engine = database.engineconn()
        db_session = db_engine.get_session()

        ingredients = request.ingredients
        count = request.count
        # 로거 설정
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        logger.info("현재 count는 %d", count)

        for ing in ingredients:
            if ing in embedding_model.wv.key_to_index:
                embeddings.append(embedding_model.wv[ing].tolist())
            else:
                logging.warning(f"Ingredient {ing} not found in embeddings, skipping.")
        
        if not embeddings:
            raise ValueError("No valid embeddings found for the provided ingredients.")
        
        ingredient_vector = np.mean(embeddings, axis=0)
        #nearby_recipe_keys = find_similar_recipes(recipe_vector, threshold=0.8)
        
        #logging.info("Recipe 모델에서 유사도가 0.7 이상인 레시피 키: %s", nearby_recipe_keys)
        
        #top_6_rcp_sno = find_top_6_common_rcp_sno(ingredients, nearby_recipe_keys, cnt=count)
        top_6_rcp_sno = find_cosine_similarity_ingredients(ingredient_vector, cnt= count, ingredientsIdx= ingredients)
        # Database 쿼리
        
        try:
            ingredients = db_session.query(Ingredient).filter(Ingredient.ingredient_id.in_(top_6_rcp_sno)).all()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
        
        result = [
            RecommendIngredientListResponse(
            ingredientId=ingredient.ingredient_id,
            name=ingredient.item_name
        ) for ingredient in ingredients
        ]

        return ResponseDTO.from_(data=result)
    except (IntegrityError, SQLAlchemyError) as e:
        print(f"Database error occurred: {e}")  # 두 에러를 한 번의 메시지 출력으로 통합

    except Exception as e:
        raise

    finally:
        db_session.close()  # 세션을 닫습니다.