import requests
import pandas as pd
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

# 인증 정보
cert_key = 'd1101c1f-578b-4e60-a787-4b5dc49a63b0'
cert_id = '4781'

# KAMIS API 엔드포인트
url_daily_price = "http://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList"

# 저장할 데이터를 담을 리스트
data_list = []

# 요청 변수 설정
product_cls_code = '01'  # 구분 (02:도매, 01:소매)
item_category_code_list = ['500']  # 각 부류 코드
country_code = '1101'  # 지역코드 (1101: 서울)
convert_kg_yn = 'Y'  # kg단위 환산 여부

# 시작 및 종료 날짜 설정
start_year = 1997
end_year = 1997
end_date = datetime(end_year, 12, 31)

# 품목별로 데이터를 수집
for item_category_code in item_category_code_list:
    print(f"부류 {item_category_code}에 대한 데이터 수집을 시작합니다.")
    for year in range(start_year, end_year + 1):
        start_date = datetime(year, 1, 1)
        end_of_year = end_date if year == end_year else datetime(year, 12, 31)
        current_date = start_date

        while current_date <= end_of_year:
            regday = current_date.strftime('%Y-%m-%d')
            params = {
                'p_cert_key': cert_key,
                'p_cert_id': cert_id,
                'p_returntype': 'xml',
                'p_product_cls_code': product_cls_code,
                'p_item_category_code': item_category_code,
                'p_country_code': country_code,
                'p_regday': regday,
                'p_convert_kg_yn': convert_kg_yn
            }

            try:
                response = requests.get(url_daily_price, params=params, timeout=10)
                if response.status_code == 200:
                    root = ET.fromstring(response.content)
                    for item in root.findall('.//item'):
                        data = {
                            'date': regday,
                            'item_name': item.findtext('item_name'),
                            'item_code': item.findtext('item_code'),
                            'kind_name': item.findtext('kind_name'),
                            'kind_code': item.findtext('kind_code'),
                            'rank': item.findtext('rank'),
                            'unit': item.findtext('unit'),
                            'price': item.findtext('dpr1')
                        }
                        data_list.append(data)

            except requests.exceptions.RequestException as e:
                print(f"Error: {e} for {regday}")

            current_date += timedelta(days=1)

    df = pd.DataFrame(data_list)
    df.drop_duplicates(subset=['date', 'item_name', 'item_code', 'kind_name', 'kind_code'], keep='first', inplace=True)

    for item in df['item_name'].unique():
        df_item = df[df['item_name'] == item]
        if not df_item.empty:
            item_code = df_item['item_code'].iloc[0]
            file_name = f'C:/Users/SSAFY/Desktop/분석/시계열분석/{item_code}_{item}_{start_year}_{end_year}_data.xlsx'
            df_item.to_excel(file_name, index=False)
            print(f"{file_name}에 데이터 저장 완료")
        else:
            print(f"{item}에 대한 데이터가 없습니다.")

    print(f"부류 {item_category_code}에 대한 데이터 수집이 완료되었습니다.")
