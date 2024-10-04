from fastapi import FastAPI
from app.error.GlobalExceptionHandler import add_exception_handlers
from app.routes.recommend import router as recommend_router
from fastapi.middleware.cors import CORSMiddleware
from app.common.scheduler import start_scheduler
from contextlib import asynccontextmanager
from app.schemas import Base
from app.databases.database import engineconn
from app.models.models import initialize_models
import logging
from fastapi import FastAPI
from app.common.config import settings


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    engine = engineconn().engine
    Base.metadata.create_all(engine)
    
    # 모델 초기화
    try:
        initialize_models()
    except Exception as e:
        logger.error(f"Failed to initialize models: {e}")
        raise
    
    scheduler = start_scheduler()
    try:
        yield
    finally:
        scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

app.include_router(recommend_router, prefix="/fastapi/v1")
origins = settings.CORS_ORIGIN.split(', ')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)