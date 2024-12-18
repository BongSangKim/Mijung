from typing import Optional, Tuple
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi.exceptions import RequestValidationError
from app.databases.database import engineconn
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.schemas.ingredient import Ingredient
from app.schemas import IngredientInfo, ingredientRate
from sqlalchemy import not_
import requests
import datetime
from app.error.GlobalExceptionHandler import add_exception_handlers
from app.common.config import settings
import xml.etree.ElementTree as ET
import pytz
import re
import logging
def fetch_data_from_api():
    # SQLAlchemy engine과 세션 가져오기
    db_engine = engineconn()
    db_session = db_engine.get_session()

    # model = load

    try:
        # 데이터베이스에서 필터링
        filtered_ingredients = db_session.query(Ingredient).filter(
            Ingredient.is_priced == True
        ).all()
        logging.debug(f"Filtered ingredients count: {len(filtered_ingredients)}")  # 필터링된 재료 수 확인
        today = datetime.date.today().strftime('%Y-%m-%d')
        db_session.query(IngredientInfo).filter(IngredientInfo.date == today).delete()
        db_session.query(ingredientRate.IngredientRate).filter(ingredientRate.IngredientRate.date == today).delete()

        # 각 ingredient에 대해 API 요청
        for ingredient in filtered_ingredients:
            # 현재 날짜를 p_regday로 설정 (yyyy-mm-dd 포맷)
            
                    # 기존 데이터 삭제: ingredient_info 및 ingredient_rate 테이블에서 오늘 날짜의 데이터

            if ingredient.product_rank_code != '07':    
                # API 요청 구성
                url = (
                    f"http://www.kamis.or.kr/service/price/xml.do?action=ItemInfo"
                    f"&p_productclscode=01&p_regday={today}"
                    f"&p_itemcategorycode={ingredient.item_category_code}"
                    f"&p_itemcode={ingredient.item_code}"
                    f"&p_kindcode={ingredient.kind_code}"
                    f"&p_convert_kg_yn=N"
                    f"&p_cert_key={settings.KAMIS_KEY}&p_cert_id={settings.KAMIS_ID}&p_returntype=xml"
                )
            else :
                url=(
                    f"http://www.kamis.or.kr/service/price/xml.do?action=EcoPriceList"
                    f"&p_productclscode=01&p_regday={today}"
                    f"&p_itemcategorycode={ingredient.item_category_code}"
                    f"&p_itemcode={ingredient.item_code}"
                    f"&p_kindcode={ingredient.kind_code}"
                    f"&p_convert_kg_yn=N"
                    f"&p_cert_key={settings.KAMIS_KEY}&p_cert_id={settings.KAMIS_ID}&p_returntype=xml"
                )
            
            
            try:
                response = requests.get(url)
                response.raise_for_status()  # Raise an HTTPError for bad status
                data = response.text
                # XML 데이터 파싱
                root = ET.fromstring(data)

                # 첫 번째 <item> 요소 찾기
                first_item = root.find('.//data/item')
                
                # price, weekprice, monthprice, yearprice 추출하기
                if first_item is not None:
                    
                    price = extract_price(first_item.find('price').text)
                    if ingredient.product_rank_code != '07':
                        weekprice, monthprice, yearprice = 0,0,0
                        week_item = first_item.find('weekprice')
                        month_item = first_item.find('monthprice')
                        year_item = first_item.find('yearprice')
                        if week_item is not None:
                            weekprice = extract_price(week_item.text)
                            if weekprice == 0:
                                weekprice = price
                        if month_item is not None:
                            monthprice = extract_price(month_item.text)
                            if monthprice == 0:
                                monthprice=price
                        if year_item is not None:
                            yearprice = extract_price(year_item.text)
                            if yearprice==0:
                                yearprice=price
                            
                        else:
                            print("Week, month, or year price not found in the XML data for item: " + str(ingredient))
                            continue  # 다음 반복으로 넘어갑니다.

                    else: 
                        weekprice = monthprice = yearprice = price
                        
                    diff_week, diff_month, diff_year = extract_rates_from_element(root)
                    
                    if price == 0:
                        price = weekprice

                  #  preditedprice = model.predict()
                    ingredient_info = IngredientInfo(
                        date=today,
                        price=price,
                        ingredient_id=ingredient.ingredient_id  # 다른 외래 키 값으로 설정
                    )
                    ingredient_rate = ingredientRate.IngredientRate(
                        date=today,
                        ingredient_id=ingredient.ingredient_id,
                        week_increase_price=abs(weekprice - price), 
                        week_increase_rate=diff_week,
                        month_increase_rate=diff_month,
                        month_increase_price=abs(monthprice-price),
                        year_increase_rate=diff_year,
                        year_increase_price=abs(yearprice - price)
                    )

                    db_session.add(ingredient_info)
                    db_session.add(ingredient_rate)
#                    db_session.add(ingredient_predict)
                    db_session.commit()

                else:
                    logging.info("No item found in the XML data." + str(ingredient))
            except requests.RequestException as e:  # requests 라이브러리 전용 예외 처리
                logging.info(f"An error occurred while fetching data for item code {ingredient.item_code}: {e}")
            except SQLAlchemyError as e:
                logging.info(f"Error occurred while inserting into the database: {e}")
        
    except (IntegrityError, SQLAlchemyError) as e:
        logging.info(f"Database error occurred: {e}")  # 두 에러를 한 번의 메시지 출력으로 통합
    except Exception as e:
        logging.info(f"An unexpected error occurred: {e}")  # 일반적인 예외 처리
    finally:
        db_session.close()  # 세션을 닫습니다.

def extract_price(price_text):
    # 정규 표현식을 사용하여 숫자만 추출
    extracted = re.sub(r'[^\d]', '', price_text)    
    # 추출된 문자열이 비어있는 경우 0을 반환, 그렇지 않으면 정수로 변환하여 반환
    return int(extracted) if extracted else 0

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        fetch_data_from_api,
        CronTrigger(hour=13, minute=00, second=0, timezone=pytz.timezone('Asia/Seoul')) #실제 서비스
        #CronTrigger(minute='*') #테스트
    )
    scheduler.start()
    return scheduler


def extract_rates_from_element(root: ET.Element) -> Tuple[Optional[float], Optional[float], Optional[float]]:
    try:
        # Find the item with countyname "등락률"
        rate_item = root.find(".//data/item[countyname='등락률']")

        if rate_item is None:
            logging.info("Rate information not found in the XML data")
            return 0, 0, 0

        # Extract rates
        weekrate = extract_rate(rate_item.find('weekprice').text)
        monthrate = extract_rate(rate_item.find('monthprice').text)
        yearrate = extract_rate(rate_item.find('yearprice').text)

        return weekrate, monthrate, yearrate

    except RequestValidationError as e:
        logging.info("not valid data")
        return 0, 0, 0

def extract_rate(rate_text: str) -> Optional[float]:
    if rate_text is None or rate_text == '-':
        return 0
    try:
        # Remove commas and convert to float
        rate_text = rate_text.replace(',', '')
        return float(rate_text)
    except ValueError:
        print(f"Could not convert '{rate_text}' to float")
        return 0