# models.py
from gensim.models import Word2Vec, KeyedVectors
from pyspark.sql import SparkSession
import ast
from pyspark.sql.functions import col, explode, udf
from pyspark.sql.types import StringType, ArrayType
import findspark
import logging

findspark.init()

# 전역 변수 정의
spark = None
embedding_model = None
recipe_model = None
exploded_df = None

def initialize_models():
    global spark, embedding_model, recipe_model, exploded_df
    
    try:
        # Spark 초기화
        #.master("local[*]") \
        #.master("spark://3.35.55.230:7077") \
        
        #    .master("local[*]") \ 백업용 (원래 코드)
        #   .master("spark://3.36.68.89:7077") \
        spark = SparkSession.builder \
            .appName("MySparkApp") \
            .master("local[*]")\
            .config("spark.hadoop.fs.defaultFS", "hdfs://localhost:9000") \
            .config("spark.ui.port", "5050") \
                .config("spark.hadoop.fs.socket.timeout", "10000") \
            .getOrCreate()
        logging.info("Spark 세션이 성공적으로 초기화되었습니다.")

        # 임베딩 모델 로드
        embedding_model = Word2Vec.load("app/embedding/embedding.model")
        logging.info("Word2Vec 모델이 성공적으로 로드되었습니다.")

        # 레시피 모델 로드
        recipe_model = KeyedVectors.load("app/embedding/recipe_embeddings.kv")
        logging.info("Recipe KeyedVectors 모델이 성공적으로 로드되었습니다.")

        # exploded_df 생성
        # df = spark.read.csv("app/embedding/soyeon3.csv", header=True, inferSchema=True) 백업용
        df = spark.read.csv("hdfs://localhost:9000/soyeon3.csv", header=True, inferSchema=True)
        convert_udf = udf(lambda x: ast.literal_eval(x), ArrayType(StringType()))
        df_with_list = df.withColumn("Numbers", convert_udf(col("Numbers from href")))
        exploded_df = df_with_list.select("RCP_SNO", explode(col("Numbers")).alias("Number"))
        logging.info("Exploded DataFrame이 성공적으로 생성되었습니다.")

    except Exception as e:
        logging.error(f"모델 초기화 중 오류 발생: {e}")
        raise

def get_embedding_model():
    global embedding_model
    if embedding_model is None:
        raise RuntimeError("Embedding model is not initialized")
    return embedding_model

def get_recipe_model():
    global recipe_model
    if recipe_model is None:
        raise RuntimeError("Recipe model is not initialized")
    return recipe_model

def get_exploded_df():
    global exploded_df
    if exploded_df is None:
        raise RuntimeError("Exploded DataFrame is not initialized")
    return exploded_df