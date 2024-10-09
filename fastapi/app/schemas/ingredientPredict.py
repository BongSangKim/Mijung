from sqlalchemy import Column, Integer, Date
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel, ConfigDict
from typing import Optional
from .base import Base

# SQLAlchemy ORM 모델
class IngredientPredict(Base):
    __tablename__ = 'Ingredientpredict'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    date = Column(Date, nullable=False)
    predict_price = Column(Integer, nullable=False)
    
    # Relationship을 정의합니다. Ingredient ORM 모델과의 관계
    ingredient_id = Column(Integer, nullable=False)  # 외래 키 ID
    ingredient = relationship("Ingredient", back_populates="ingredient_predict")  # Ingredient 모델과의 관계 설정

    def __init__(self, date: str, predict_price: int, ingredient_id: int):
        self.date = date
        self.predict_price = predict_price
        self.ingredient_id = ingredient_id

# Pydantic 스키마
class IngredientPredictSchema(BaseModel):
    id: Optional[int]
    date: str  # LocalDate를 문자열로 처리
    predict_price: int
    ingredient_id: int

    model_config = ConfigDict(from_attributes=True)
