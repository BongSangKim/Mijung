import pandas as pd
import mysql.connector
from mysql.connector import Error
from datetime import datetime
# 엑셀 파일 읽기
excel_file = "C:/jupyterNotebook/tomorrow/csvConvert/ingredient_predicted.xlsx"
df = pd.read_excel(excel_file, dtype={'predictedPrice': str})

# MySQL 연결 매개변수 설정
try:
    cnx = mysql.connector.connect(
        user='mijung',  # MySQL 사용자 이름
        password='mijungmijungmijung',  # MySQL 비밀번호
        host='localhost',  # 호스트
        database='mijung'  # 데이터베이스 이름
    )
    cursor = cnx.cursor()

    # DataFrame의 행을 반복하여 MySQL에 데이터 삽입
    for index, row in df.iterrows():
        try:
            # item_code를 기반으로 ingredient_id 조회
            cursor.execute("SELECT ingredient_id FROM ingredient WHERE item_code = %s", (row['item_code'],))
            result = cursor.fetchone()

            # 이전 결과를 명확히 하기 위해 사용 (모든 결과를 읽음)
            cursor.fetchall()  # 읽지 않은 결과가 남지 않도록 처리
            # price 값 처리
            price_value = row['predictedPrice']
            ##print(f"Row {index}: Original Price = {price_value}, Type = {type(price_value)}")
            
            

            # 쉼표 제거 및 정수로 변환
            try:
                price_as_int = int(price_value.replace(',', ''))
                print(f"Converted Price = {price_as_int}")
            except ValueError:
                print(f"Error: Invalid price value in row {index}: {price_value}")
                continue  # 이 행은 건너뛰고 다음 행으로

            if result:
                ingredient_id = result[0]
                # 날짜 처리
                if isinstance(row['date'], pd.Timestamp):
                    dt_1 = row['date'].strftime("%Y-%m-%d")
                else:
                    # 이미 문자열인 경우 그대로 사용
                    dt_1 = row['date']
                # ingredientinfo 테이블에 데이터 삽입
                cursor.execute(
                    "INSERT INTO ingredientpredict (date, predictedPrice, ingredient_id, ingredient_predict_id) VALUES (%s, %s, %s, %s)",
                    (dt_1, price_as_int, ingredient_id, index + 1)  # index + 1로 ingredient_info_id 자동 증가
                )
                cnx.commit()  # 삽입된 데이터 즉시 커밋

            else:
                print(f"Error: item_code {row['item_code']}에 해당하는 ingredient_id를 찾을 수 없습니다.")

        except Error as e:
            print(f"Error inserting row {index}: {e}")
            cnx.rollback()  # 오류 발생 시 롤백

    print("Data insertion completed successfully!")

except Error as e:
    print(f"Error connecting to MySQL: {e}")

finally:
    # 커서 및 연결 종료
    if 'cursor' in locals():
        cursor.close()
    if 'cnx' in locals():
        cnx.close()