import logging
import pytest
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, when, explode
import ast
import findspark
from gensim.models import Word2Vec, KeyedVectors
import numpy as np
findspark.init()

# 로깅 설정
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # 로그 레벨 설정

# 콘솔 출력을 위한 핸들러 추가
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)  # 출력할 로그 레벨 설정
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

# 파일 핸들러 추가
fh = logging.FileHandler('test_log.log', mode='w')
fh.setLevel(logging.INFO)  # 파일에 남기고 싶은 레벨 설정
fh.setFormatter(formatter)
logger.addHandler(fh)

# Spark 세션 생성
@pytest.fixture(scope="module")
def spark():
    spark_session = SparkSession.builder \
        .appName("Soyeon CSV Test") \
        .master("local[*]") \
        .getOrCreate()
    
    yield spark_session
    spark_session.stop()

# CSV 파일 읽기
def read_csv(spark):
    df = spark.read.csv("app/embedding/soyeon.csv", header=True, inferSchema=True)
    return df

# Numbers from href 열을 리스트로 변환하는 함수
def convert_string_to_list(string_value):
    return ast.literal_eval(string_value)

# UDF 등록
from pyspark.sql.functions import udf
from pyspark.sql.types import ArrayType, StringType

convert_udf = udf(convert_string_to_list, ArrayType(StringType()))

# 3개의 정수를 입력받기 위한 함수
def find_top_6_common_rcp_sno(spark, int1, int2, int3):
    # CSV 파일 읽기
    df = read_csv(spark)

    # 'Numbers from href' 열을 리스트로 변환
    df_with_list = df.withColumn("Numbers", convert_udf(col("Numbers from href")))

    # 각 RCP_SNO에 대해 Numbers 리스트의 값을 explode
    exploded_df = df_with_list.select("RCP_SNO", explode(col("Numbers")).alias("Number"))

    # 입력받은 정수들을 리스트로 만들기
    input_values = [str(int1), str(int2), str(int3)]

    # Numbers 값이 input_values에 포함되는 경우를 세어 카운트
    result_df = exploded_df.groupBy("RCP_SNO").agg(
        count(when(col("Number").isin(input_values), 1)).alias("count")
    )

    # 개수가 가장 많은 RCP_SNO 6개를 찾기
    top_6_rcp_sno = result_df.orderBy(col("count").desc()).limit(6).collect()

    return [(row['RCP_SNO'], row['count']) for row in top_6_rcp_sno]  # (RCP_SNO, count) 형태로 반환

# 테스트 함수
def test_find_top_6_common_rcp_sno(spark):
    int1 = '743'  # 하드코딩된 첫 번째 정수
    int2 = '410'  # 하드코딩된 두 번째 정수
    int3 = '14'   # 하드코딩된 세 번째 정수

    top_6_rcp_sno = find_top_6_common_rcp_sno(spark, int1, int2, int3)

    logger.info("가장 많이 발생한 상위 6개의 RCP_SNO:")
    for rcp_sno, count in top_6_rcp_sno:
        logger.info(f"RCP_SNO: {rcp_sno}, Count: {count}")

    # 여기에 결과에 대한 assertions을 추가할 수 있습니다.
    assert top_6_rcp_sno is not None  # 적어도 값이 반환되어야 함
    # 이 부분에 결과를 고정된 값과 비교하는 assertion을 추가하십시오.
