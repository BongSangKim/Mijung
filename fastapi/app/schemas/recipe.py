from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import TEXT, Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum

from app.schemas.material import MaterialRead
from .base import Base

# Enum definitions
class Inbun(str, enum.Enum):
    ONE = "1인분"
    TWO = "2인분"
    THREE = "3인분"
    FOUR = "4인분"
    FIVE = "5인분"
    SIX_OR_MORE = "6인분 이상"

class Kind(str, enum.Enum):
    SIDE_DISH = "밑반찬"
    MAIN_DISH = "메인반찬"
    SOUP_STEW = "국/탕"
    STEW = "찌개"
    DESSERT = "디저트"
    NOODLES_DUMPLINGS = "면/만두"
    RICE_PORRIDGE_RICE_CAKE = "밥/죽/떡"
    FUSION = "퓨전"
    KIMCHI_PICKLES_SAUCES = "김치/젓갈/장류"
    SEASONING_SAUCE_JAM = "양념/소스/잼"
    WESTERN = "양식"
    SALAD = "샐러드"
    SOUP = "스프"
    BREAD = "빵"
    SNACK = "과자"
    TEA_BEVERAGE_ALCOHOL = "차/음료/술"
    OTHER = "기타"

class Level(str, enum.Enum):
    ANYONE = "아무나"
    BEGINNER = "초급"
    INTERMEDIATE = "중급"
    ADVANCED = "고급"
    MASTER = "신의경지"

class CookingTime(str, enum.Enum):
    WITHIN_5_MINUTES = "5분이내"
    WITHIN_10_MINUTES = "10분이내"
    WITHIN_15_MINUTES = "15분이내"
    WITHIN_20_MINUTES = "20분이내"
    WITHIN_30_MINUTES = "30분이내"
    WITHIN_60_MINUTES = "60분이내"
    WITHIN_90_MINUTES = "90분이내"
    WITHIN_2_HOURS = "2시간이내"
    MORE_THAN_2_HOURS = "2시간이상"

class Recipe(Base):
    __tablename__ = 'recipe'

    recipe_id: int = Column(Integer, primary_key=True, nullable=False)
    name: Optional[str] = Column(TEXT, nullable=True)
    hit: Optional[int] = Column(Integer, nullable=True)
    scrap_count: Optional[int] = Column(Integer, nullable=True)
    kind: Optional[Kind] = Column(Enum(Kind), nullable=True)
    inbun: Optional[Inbun] = Column(Enum(Inbun), nullable=True)
    level: Optional[Level] = Column(Enum(Level), nullable=True)
    cooking_time: Optional[CookingTime] = Column(Enum(CookingTime), nullable=True)
    image: Optional[str] = Column(String(255), nullable=True)

    material = relationship("Material", back_populates="recipe")  # Adjyust as per your actual model

# Pydantic models for input/output
class RecipeCreate(BaseModel):
    name: Optional[str]
    hit: Optional[int]
    scrap_count: Optional[int]
    kind: Optional[Kind]
    inbun: Optional[Inbun]
    level: Optional[Level]
    cooking_time: Optional[CookingTime]
    image: Optional[str]

class RecipeRead(BaseModel):
    recipeId: int
    name: Optional[str]
    hit: Optional[int]
    scrap_count: Optional[int]
    kind: Optional[Kind]
    inbun: Optional[Inbun]
    level: Optional[Level]
    cooking_time: Optional[CookingTime]
    image: Optional[str]
    materials: List['MaterialRead']  # Ensure MaterialRead is defined

    model_config = ConfigDict(from_attributes=True)
