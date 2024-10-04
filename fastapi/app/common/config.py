import os
from dotenv import load_dotenv
from functools import lru_cache

load_dotenv()

class Settings():
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