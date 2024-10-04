import numpy as np
from pyspark.sql.functions import col, udf, array_contains, from_json, reduce
from pyspark.sql.types import BooleanType, FloatType, StringType, ArrayType
import logging
import findspark
from gensim.models import Word2Vec, KeyedVectors
import pytest
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, when, explode
import ast

findspark.init()

# Set up logging
logger = logging.getLogger('RecipeSimilarityLogger')
logger.setLevel(logging.DEBUG)
fh = logging.FileHandler('recipe_0_5_within_merged.log')
fh.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logger.addHandler(fh)

def find_similar_recipes(recipe_vector, recipe_model, threshold=0.7):
    # Get similar words from the Recipe model
    similar_words_recipe = recipe_model.similar_by_vector(recipe_vector, topn=300)

    # Check whether similar_words_recipe is iterable and structured properly
    if isinstance(similar_words_recipe, list):
        # Filter keys based on similarity >= threshold
        filtered_keys = [word for word, similarity in similar_words_recipe if similarity >= threshold]
    else:
        logger.error("Unexpected structure returned from similar_by_vector")
        filtered_keys = []

    return filtered_keys

# CSV 파일 읽기
# 중복된 read_csv 함수 정의를 제거하여 AttributeError를 방지함
def read_csv(spark):
    return spark.read.csv("app/embedding/soyeon3.csv", header=True, inferSchema=True)

# Numbers from href 열을 리스트로 변환하는 함수
def convert_string_to_list(string_value):
    return ast.literal_eval(string_value)

convert_udf = udf(convert_string_to_list, ArrayType(StringType()))

# 3개의 정수를 입력받기 위한 함수
def find_top_6_common_rcp_sno(spark, ingredient, nearby_recipe_keys):
    # CSV 파일 읽기
    df = read_csv(spark)

    # 'Numbers from href' 열을 리스트로 변환
    df_with_list = df.withColumn("Numbers", convert_udf(col("Numbers from href")))

    # 각 RCP_SNO에 대해 Numbers 리스트의 값을 explode
    exploded_df = df_with_list.select("RCP_SNO", explode(col("Numbers")).alias("Number"))

    # nearby_recipe_keys 를 사용하여 RCP_SNO를 필터링
    filtered_df = exploded_df.filter(col("RCP_SNO").isin(nearby_recipe_keys))

    # Numbers 값이 ingredient에 포함되는 경우를 세어 카운트
    result_df = filtered_df.groupBy("RCP_SNO").agg(
        count(when(col("Number").isin(ingredient), 1)).alias("count")
    )

    # 개수가 가장 많은 RCP_SNO 6개를 찾기
    top_6_rcp_sno = result_df.orderBy(col("count").desc()).limit(6).collect()

    return [(row['RCP_SNO'], row['count']) for row in top_6_rcp_sno]  # (RCP_SNO, count) 형태로 반환

# Spark 세션 생성
@pytest.fixture(scope="module")
def spark():
    spark_session = SparkSession.builder \
        .appName("Soyeon CSV Test") \
        .master("local[*]") \
        .getOrCreate()
    
    yield spark_session
    spark_session.stop()

@pytest.fixture(scope="session")
def models():
    # Load models
    model = Word2Vec.load('app/embedding/embedding.model')
    recipe_model = KeyedVectors.load('app/embedding/recipe_embeddings.kv')
    return model, recipe_model

def test_find_top_6(models, spark):
    model, recipe_model = models
    
    # 임베딩 계산
    ingredients = ['743', '410', '14']
    embeddings = []
    
    for ing in ingredients:
        if ing in model.wv.key_to_index:  # 키가 있는지 확인
            embeddings.append(model.wv[ing].tolist())
        else:
            logger.warning(f"Ingredient {ing} not found in embeddings, skipping.")

    if not embeddings:  # 임베딩이 없으면 에러 발생
        raise ValueError("No valid embeddings found for the provided ingredients.")
    
    # Average 계산
    recipe_vector = np.mean(embeddings, axis=0)  # NumPy 배열로 평균 계산

    # 유사도를 기준으로 레시피 검색
    nearby_recipe_keys = find_similar_recipes(recipe_vector, recipe_model, threshold=0.7)

    logger.info("Recipe 모델에서 유사도가 0.7 이상인 레시피 키: %s", nearby_recipe_keys)

    top_6_rcp_sno = find_top_6_common_rcp_sno(spark, ingredients, nearby_recipe_keys)

    logger.info("가장 많이 발생한 상위 6개의 RCP_SNO:")
    for rcp_sno, count in top_6_rcp_sno:
        logger.info(f"RCP_SNO: {rcp_sno}, Count: {count}")
