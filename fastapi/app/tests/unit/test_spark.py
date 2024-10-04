import logging
import pytest
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sqrt
from pyspark.sql.types import StructType, StructField, IntegerType, DoubleType
import findspark
# 로깅 설정
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

findspark.init()

@pytest.fixture(scope="module")
def spark():
    logger.info("## Creating SparkSession ##")
    spark_session = SparkSession.builder \
    .appName("PySpark FastAPI Test") \
    .master("local[*]") \
    .config("spark.driver.host", "localhost") \
    .config("spark.driver.bindAddress", "127.0.0.1") \
    .config("spark.local.ip", "127.0.0.1") \
    .config("spark.executor.memory", "2g") \
    .config("spark.driver.memory", "2g") \
    .getOrCreate()

    yield spark_session
    logger.info("## Stopping SparkSession ##")
    spark_session.stop()

@pytest.fixture(scope="module")
def test_data(spark):
    logger.info("## Creating Test DataFrame ##")

    data = [
        (1, 0.0, 0.0),
        (2, 1.0, 1.0),
        (3, 2.0, 2.0),
        (4, 1.0, 0.5),
        (5, 0.5, 0.5)
    ]
    schema = StructType([
        StructField("id", IntegerType(), False),
        StructField("x", DoubleType(), False),
        StructField("y", DoubleType(), False)
    ])

    try:
        df = spark.createDataFrame(data, schema)
        logger.info("DataFrame created successfully!")
    except Exception as e:
        logger.error("Error creating DataFrame: %s", str(e))
        raise

    logger.debug("## DataFrame content ##")
    df.show()
    return df

def test_points_within_radius(spark, test_data):
    center_x, center_y = 0.0, 0.0
    radius = 1.0

    logger.info("## Filtering points within radius: %f ##", radius)
    try:
        df_filtered = test_data.withColumn(
            'distance', sqrt((col("x") - center_x) ** 2 + (col("y") - center_y) ** 2)
        ).filter(col('distance') <= radius)

        logger.debug("Filtered DataFrame:")

    except Exception as ex:
        logger.error("Exception during filtering: %s", str(ex))
        raise

    expected_ids = {1, 5}
    result_ids = {row['id'] for row in df_filtered.collect()}
    logger.info("Expected IDs: %s, Result IDs: %s", expected_ids, result_ids)

    assert result_ids == expected_ids