from sqlalchemy import *
from sqlalchemy.orm import sessionmaker
from app.common.config import settings

DB_URL = f'mysql+pymysql://{settings.DB_USERNAME}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}'

class engineconn:

    def __init__(self):
        self.engine = create_engine(DB_URL, pool_recycle = 500)

    def get_session(self):
        Session = sessionmaker(bind=self.engine)
        session = Session()
        return session

    def connect(self):
        conn = self.engine.connect()
        return conn