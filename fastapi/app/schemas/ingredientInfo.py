from sqlalchemy import Column, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from typing import Optional
from .base import Base

# SQLAlchemy ORM 모델
class IngredientInfo(Base):
    __tablename__ = 'ingredientinfo'

    ingredient_info_id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    date = Column(Date, nullable=False)
    price = Column(Integer, nullable=False)
    ingredient_id = Column(Integer, ForeignKey('ingredient.ingredient_id'), nullable=False)
    
    ingredient = relationship("Ingredient",  back_populates="ingredientinfo")

    def __init__(self, date: str, price: int, ingredient_id: int):
        self.date = date
        self.price = price
        self.ingredient_id = ingredient_id

# Pydantic 스키마
class IngredientInfoSchema(BaseModel):
    ingredient_info_id: Optional[int]
    date: str  # LocalDate를 문자열로 처리
    price: int
    ingredient_id: int

    class Config:
        from_attributes = True
