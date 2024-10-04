import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import not_
from app.schemas.ingredient import Ingredient, Base

DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="module")
def engine():
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)  # 테이블 생성
    yield engine
    Base.metadata.drop_all(engine)  # 테스트가 끝난 후 테이블 삭제

@pytest.fixture(scope="function")
def session(engine):
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.rollback()
        session.close()

def test_db_ingredient(session):
    # 테스트 데이터 준비
    ingredients_data = [
        Ingredient(id=1, item_category_code='001', item_category_name='Category 1', item_code='IC1', item_name='Ingredient 1', kind_code='K1', kind_name='Kind 1', product_rank_code='001', is_priced=True),
        Ingredient(id=2, item_category_code='002', item_category_name='Category 2', item_code='IC2', item_name='Ingredient 2', kind_code='K2', kind_name='Kind 2', product_rank_code='007', is_priced=True),
        Ingredient(id=3, item_category_code='003', item_category_name='Category 3', item_code='IC3', item_name='Ingredient 3', kind_code='K3', kind_name='Kind 3', product_rank_code='008', is_priced=True),
        Ingredient(id=4, item_category_code='004', item_category_name='Category 4', item_code='IC4', item_name='Ingredient 4', kind_code='K4', kind_name='Kind 4', product_rank_code='009', is_priced=False),
    ]

    session.add_all(ingredients_data)
    session.commit()

    # 데이터 쿼리와 검증
    filtered_ingredients = session.query(Ingredient).filter(
        Ingredient.is_priced == True,
        not_(Ingredient.product_rank_code.like('%07%'))
    ).all()

    assert len(filtered_ingredients) == 2
    assert all('07' not in ingredient.product_rank_code for ingredient in filtered_ingredients)
