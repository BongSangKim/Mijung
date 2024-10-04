import unittest
from pyspark.sql import SparkSession


class TestSparkSession(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Spark 세션을 설정
        cls.spark = SparkSession.builder \
            .appName("TestSparkSession") \
            .master("local[*]") \
            .getOrCreate()

    @classmethod
    def tearDownClass(cls):
        # 모든 테스트가 끝난 후에 Spark 세션 정지
        cls.spark.stop()

    def test_spark_session_initialization(self):
        # 테스트: Spark 세션이 올바르게 초기화되었는지 확인
        self.assertIsNotNone(self.spark)
    
    def test_dataframe_creation(self):
        # 간단한 데이터프레임 생성 테스트
        data = [(1, "Apple"), (2, "Orange"), (3, "Banana")]
        df = self.spark.createDataFrame(data, ["id", "fruit"])

        # 데이터프레임 크기 확인: 행 개수 및 열 개수
        self.assertEqual(df.count(), 3)
        self.assertEqual(len(df.columns), 2)

        # 첫 번째 행의 데이터 검증
        first_row = df.first()
        self.assertEqual(first_row['id'], 1)
        self.assertEqual(first_row['fruit'], "Apple")


if __name__ == '__main__':
    unittest.main()
