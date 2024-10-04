from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from typing import Optional
from .base import Base

# SQLAlchemy ORM 모델
class IngredientRate(Base):
    __tablename__ = 'ingredientrate'

    ingredient_rate_id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    date = Column(Date, nullable=False)
    week_increase_rate = Column(Float, nullable=False, name="week_increase_rate")
    month_increase_rate = Column(Float, nullable=False, name="month_increase_rate")
    year_increase_rate = Column(Float, nullable=False, name="year_increase_rate")
    week_increase_price = Column(Integer, nullable=False, name="week_increase_price")
    month_increase_price = Column(Integer, nullable=False, name="month_increase_price")
    year_increase_price = Column(Integer, nullable=False, name="year_increase_price")
    
    # Ingredient와의 관계 설정
    ingredient_id = Column(Integer, ForeignKey('ingredient.ingredient_id'), nullable=False)  # Foreign key
    ingredient = relationship("Ingredient", back_populates="ingredientrate")  # Relationship 설정

    def __init__(self, date: str, week_increase_rate: float, 
                 week_increase_price: int, ingredient_id: int, 
                 month_increase_rate: float, month_increase_price: int,
                 year_increase_rate: float, year_increase_price: int):
        self.date = date
        self.week_increase_rate = week_increase_rate
        self.week_increase_price = week_increase_price
        self.ingredient_id = ingredient_id
        self.month_increase_price = month_increase_price
        self.month_increase_rate=month_increase_rate
        self.year_increase_price=year_increase_price
        self.year_increase_rate=year_increase_rate

# Pydantic 스키마
class IngredientRateSchema(BaseModel):
    ingredient_rate_id: Optional[int]
    date: str  # LocalDate를 문자열로 처리
    week_increase_rate: float
    week_increase_price: int
    month_increase_rate: float
    month_increase_price: int
    year_increase_rate: float
    year_increase_price: int
    ingredient_id: int

    class Config:
        from_attributes = True
