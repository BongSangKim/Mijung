# Import necessary modules
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from .base import Base

class Ingredient(Base):
    __tablename__ = 'ingredient'

    ingredient_id = Column(Integer, primary_key=True, nullable=False)
    item_category_code = Column(String(20), nullable=False)
    item_category_name = Column(String(20), nullable=False)
    item_code = Column(String(10), nullable=False)
    item_name = Column(String(20), nullable=False)
    kind_code = Column(String(10), nullable=False)
    kind_name = Column(String(20), nullable=False)
    retail_unit = Column(String(10))
    retail_unitsize = Column(String(10))
    product_rank_code = Column(String(3), nullable=False)
    image = Column(String)
    is_priced = Column(Boolean, nullable=False)

    ingredientinfo = relationship("IngredientInfo", back_populates="ingredient") # back_populates는 db 이름이랑 맞아야됨
    ingredientrate = relationship("IngredientRate", back_populates="ingredient") # 앞은 class이름과 같아야됨
    
    def __init__(self, id, item_category_code, item_category_name, item_code, item_name,
                 kind_code, kind_name, retail_unit=None, retail_unitsize=None,
                 product_rank_code=None, image=None, is_priced=True):
        self.ingredient_id = id
        self.item_category_code = item_category_code
        self.item_category_name = item_category_name
        self.item_code = item_code
        self.item_name = item_name
        self.kind_code = kind_code
        self.kind_name = kind_name
        self.retail_unit = retail_unit
        self.retail_unitsize = retail_unitsize
        self.product_rank_code = product_rank_code
        self.image = image
        self.is_priced = is_priced


    def __str__(self):
        return (f"Ingredient(id={self.ingredient_id}, "
                f"item_code='{self.item_code}', "
                f"item_name='{self.item_name}', "
                f"category='{self.item_category_name}', "
                f"kind='{self.kind_name}', "
                f"price_status={'Priced' if self.is_priced else 'Not Priced'})")