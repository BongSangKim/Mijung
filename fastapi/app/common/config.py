import os
from dotenv import load_dotenv
from functools import lru_cache

load_dotenv()
os.environ['HADOOP_USER_NAME'] = 'ubuntu'
class Settings():
  SPARK_URL = os.environ.get('SPARK_URL')
  HADOOP_URL = os.environ.get('HADOOP_URL')
  BASIC_PATH= os.environ.get("BASIC_PATH")
  CSV_FILE = os.environ.get("CSV_FILE")
  EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL")
  RECIPE_MODEL = os.environ.get("RECIPE_MODEL")

  SPARK_PORT = os.environ.get('SPARK_PORT')
  HADOOP_PORT= os.environ.get('HADOOP_PORT')
  IS_LOCAL = os.environ.get('SPARK_ENV')
  DB_USERNAME = os.environ.get("MYSQL_USER")
  DB_HOST = os.environ.get("MYSQL_HOST")
  DB_PASSWORD = os.environ.get("MYSQL_PASSWORD")
  DB_NAME = os.environ.get("MYSQL_DB")
  DB_PORT = int(os.environ.get("MYSQL_PORT"))
  KAMIS_KEY = os.environ.get("KAMIS_KEY")
  KAMIS_ID = os.environ.get("KAMIS_ID")
  CORS_ORIGIN = os.environ.get("CORS_URL")
  

@lru_cache
def get_settings():
    return Settings()

settings = get_settings()