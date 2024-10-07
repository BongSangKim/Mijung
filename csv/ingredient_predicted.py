import pandas as pd
import mysql.connector
from mysql.connector import Error

# 엑셀 파일 읽기
excel_file = "your_file"
df = pd.read_excel(excel_file)

# MySQL 연결 매개변수 설정
try:
    cnx = mysql.connector.connect(
        user='',  # MySQL 사용자 이름
        password='',  # MySQL 비밀번호
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

            if result:
                ingredient_id = result[0]

                # ingredientinfo 테이블에 데이터 삽입
                cursor.execute(
                    "INSERT INTO ingredientpredict (date, predictedPrice, ingredient_id, ingredient_predict_id) VALUES (%s, %s, %s, %s)",
                    (row['date'], row['predictedPrice'], ingredient_id, index + 1)  # index + 1로 ingredient_info_id 자동 증가
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
