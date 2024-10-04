import logging
from pyspark.sql import SparkSession
from gensim.models import Word2Vec, KeyedVectors
import numpy as np
from pyspark.sql import functions as F
from pyspark.sql.types import ArrayType, FloatType
import pytest
import findspark

findspark.init()
# Set up logging
logger = logging.getLogger('RecipeSimilarityLogger')
logger.setLevel(logging.INFO)
fh = logging.FileHandler('recipe_similarity.log')
fh.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
fh.setFormatter(formatter)
logger.addHandler(fh)


@pytest.fixture(scope="module")
def spark():
    spark_session = SparkSession.builder \
        .appName("Soyeon CSV Test") \
        .config("spark.driver.maxResultSize", "2g") \
        .config("spark.executor.memory", "4g") \
        .config("spark.executor.heartbeatInterval", "60s") \
        .config("spark.network.timeout", "800s") \
        .master("local[*]") \
        .getOrCreate()
    
    yield spark_session
    spark_session.stop()


@pytest.fixture(scope="module")
def models():
    # Load models
    model = Word2Vec.load('app/embedding/embedding.model')
    recipe_model = KeyedVectors.load('app/embedding/recipe_embeddings.kv')
    return model, recipe_model


def test_find_top_find_top_6(spark, models):
    model, recipe_model = models

    ingredients = ['743', '14', '410']
    
    # Load embedding vectors for the provided ingredient IDs
    embeddings = [model.wv[ing].tolist() for ing in ingredients]  # NumPy 배열을 리스트로 변환
    recipe_vector = [sum(x)/len(embeddings) for x in zip(*embeddings)]  # 평균 계산을 리스트로 수행
    # Calculate the average embedding vector

    # Convert recipe_model to a Spark DataFrame
    # Assuming recipe_model is a dictionary with keys as recipe keys and values as vectors
    # Extract keys and vectors from KeyedVectors
    recipe_keys = list(recipe_model.index_to_key)  # or `recipe_model.key_to_index.keys()` if older version
    recipe_vectors = [recipe_model[key].tolist() for key in recipe_keys]

    # Create Spark DataFrame with recipe keys and vectors
    recipes_df = spark.createDataFrame(zip(recipe_keys, recipe_vectors), schema=['key', 'vector'])

    def cosine_similarity_udf(v1):
        magnitude_v1 = np.sqrt(np.dot(v1, v1))  # Magnitude of recipe vector
        magnitude_v2 = np.sqrt(np.dot(recipe_vector, recipe_vector))  # Magnitude of mean vector
        dot_product = np.dot(v1, recipe_vector)
        if magnitude_v1 * magnitude_v2 == 0:
            return 0.0
        cosine_similarity = dot_product / (magnitude_v1 * magnitude_v2)
        return float(cosine_similarity)

    udf_cosine_sim = F.udf(cosine_similarity_udf, FloatType())

# Calculate cosine similarity for each recipe
    similarities_df = recipes_df.repartition(100) \
                           .withColumn('similarity', udf_cosine_sim('vector')) \
                           .orderBy(F.desc('similarity')) \
                           .limit(6) \
                           .select('key')

# Collect result to return as a list
    recommended_recipes = [row['key'] for row in similarities_df.collect()]

    # Log the recommended recipes
    logger.info(f"Recommended Recipes: {recommended_recipes}")

    assert recommended_recipes != None