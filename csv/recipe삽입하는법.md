## csv 파일 삽입하는법

1. terminal을 활용해 mysql 로그인

2. db schema 컬럼 위치 조절(csv 순서와 sql 컬럼 순서를 맞춰놔야 됨)
   (recipe_id,name,hit,scrap_count,kind,inbun,level,cooking_time,image)
- 컬럼 위치를 조절하는 이유는 삽입되는 ,으로 짜르고 삽입되는 순서로 들어가기 때문임.
3. 다음 명령어 삽입,

```mysql
LOAD DATA LOCAL INFILE '{저장 경로}/reciperecipeCSV.csv'
INTO TABLE recipe
CHARACTER SET utf8
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(recipe_id,name,hit,scrap_count,kind,inbun,level,cooking_time,image);
```

참조자료 https://k-wien1589.tistory.com/68

### sql 참조

- 저는 컬럼 순서를 이렇게 바꿨는데, 팀원분들은 컬럼 순서가 어떻게 되는지 몰라서 참조해서 수정하시면 됩니다.

```sql
alter table recipe modify name TEXT after recipe_id;
alter table recipe modify hit Integer after name;

alter table recipe modify kind enum('BREAD','DESSERT','FUSION','KIMCHI_PICKLES_SAUCES','MAIN_DISH','NOODLES_DUMPLINGS','OTHER','RICE_PORRIDGE_RICE_CAKE','SALAD','SEASONING_SAUCE_JAM','SIDE_DISH','SNACK','SOUP','SOUP_STEW','STEW','TEA_BEVERAGE_ALCOHOL','WESTERN') after scrap_count;

alter table recipe modify inbun enum('FIVE','FOUR','ONE','SIX_OR_MORE','THREE','TWO') after kind

alter table recipe modify level enum('ADVANCED','ANYONE','BEGINNER','INTERMEDIATE','MASTER') after inbun;

alter table recipe modify cooking_time enum('MORE_THAN_2_HOURS','WITHIN_10_MINUTES','WITHIN_15_MINUTES','WITHIN_20_MINUTES','WITHIN_2_HOURS','WITHIN_30_MINUTES','WITHIN_5_MINUTES','WITHIN_60_MINUTES','WITHIN_90_MINUTES') after level;

alter table recipe modify image varchar(255) after cooking_time;
```

### ERROR 3948 (42000): Loading local data is disabled; this must be enabled on both the client and server sides 에러 나올 시 참조

참조 자료 https://calen.tistory.com/49

- 서버가 local-infile을 허용하고 있는지 확인

```sql
show global variables like 'local_infile';
```

- Value가 OFF이면 활성화 시키기

```sql
set global local_infile=true;
```

- 다시 로그인

```sql
mysql --local-infile -u mijung -p
```

### 9월 25일 상황

- cow.csv는 끝남
- vegetable.json은 문제를 발견해서 내일 파싱을 다시해야됨.
- - 다음과 같이 쓰면 kindcode이 없이도 모든 정보를 알 수 있다. p_itemcode만 있으면 알 수 있다..

```text
http://www.kamis.or.kr/service/price/xml.do?action=periodEcoPriceList&p_productclscode=01&p_regday=2024-09-24&p_itemcategorycode=100&p_itemcode=141&p_convert_kg_yn=Y&p_cert_key=111&p_cert_id=222&p_returntype=xml
```

### 9월 26일 상황

* cow와 vegetable을 활용해 재료 테이블을 만들고 있습니다. 내일 오전까지 다 임포트 하겠습니다.

### 9월 27일 오전 상황

* 카미스 정보와 ingredient 정보를 동기화 시켜줬다.

* 이 때, ingredient에 카미스 정보를 매핑할 때 2가지 조건을 지켰다.

* * 첨가되거나, 완성품인 경우에는 카미스 매핑에서 제거했다.

* * 말리거나, 삶거나 등 조리 방법에 차이만 있을 경우네는 카미스에서 매핑해줬다.

* 위 처리가 끝나면 태우님께서 주신 자료와 카미스 자료를 조인해서 ingredient에서 가격을 볼 수 있도록 했다.

* * 이 떄 left outer join을 했다. 이 후 null인 데이터는 기타로 빼기 위해서 700번 코드를 부여했다.

* **material**은 map을 활용해 태우님꼐서 주신 자료를 대표값으로 매핑하고, 레시피 데이터에서 하나씩 변환해갔다.

## insertingredient.sql 넣는 방법

- 식재료 테이블(ingredient table)에 데이터 넣는 코드
  
  ```mysql
  mysql -umijung -pmijungmijungmijung --default-character-set=utf8mb4 -hlocalhost mijung < {파일경로}\insertingredient.sql
  ```

## material.csv mysql에 넣는 방법

* 컬럼 순서 바꾸는 명령어
  
  ```mysql
  ALTER TABLE `mijung`.`material` 
  CHANGE COLUMN `name` `name` TEXT NOT NULL AFTER `material_id`,
  CHANGE COLUMN `analyzed` `analyzed` BIT(1) NOT NULL AFTER `type`,
  CHANGE COLUMN `recipe_id` `recipe_id` INT NOT NULL AFTER `analyzed`,
  CHANGE COLUMN `ingredient_id` `ingredient_id` INT NULL DEFAULT NULL AFTER `recipe_id`;
  ```

* mysql에 넣기(python이 빠르고 편합니다)

* * mysql.connector가 필요합니다. (!pip3 install mysql-connector-python)
    
    ```python
    import pandas as pd
    import mysql.connector
    from mysql.connector import Error
    import numpy as np
    ```

path = {폴더경로}

retdf = pd.read_csv(path+"material0927_v3.csv", encoding="utf8",dtype=str)
retdf

tempdf = retdf
tempdf.loc[tempdf['ingredient_id'].isna(), 'ingredient_id'] = None
tempdf['name']= tempdf['name'].fillna('')
tempdf['capacity']= tempdf['capacity'].fillna('')
tempdf['analyzed']= tempdf['analyzed'].fillna('')
tempdf['analyzed']=tempdf['analyzed'].astype(bool)
tempdf

# MySQL 연결 매개변수

try:
    cnx = mysql.connector.connect(user='{db user 이름}', password='{패스워드}', host='localhost', database='mijung')
    cursor = cnx.cursor()

# DataFrame의 행을 반복하여 MySQL에 데이터 삽입

    for index, row in tempdf.iterrows():
        try:
            cursor.execute(
                "INSERT INTO material (material_id, recipe_id, type, ingredient_id, name, capacity, analyzed) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (row['material_id'], row['recipe_id'], row['type'], row['ingredient_id'], row['name'], row['capacity'], row['analyzed'])
            )
        except Error as e:
            print(f"Error inserting row {index}: {e}")
    
    # 변경 사항 커밋
    cnx.commit()

except Error as e:
    print(f"Error connecting to MySQL: {e}")
finally:
    # 커서 및 연결 종료
    if 'cursor' in locals():
        cursor.close()
    if 'cnx' in locals():
        cnx.close()

```
### step 삽입하는법

* step.py 돌리세요
* * 구글드라이브에서 mergedf를 다운받아주세요.
* * db 사용자 이름, db 비밀번호, 그리고 경로값만 수정해주세요!
```

### ingredient_info 삽입하는법

- ingredient_info.py 돌리세요
- - 구글드라이브에서 sorted_and_cleaned_real_data를 다운받아주세요.
- - db 사용자 이름, db 비밀번호, 그리고 경로값만 수정해주세요!

### ingredient_cosine 삽입하는법 
  ```mysql
  mysql -umijung -pmijungmijungmijung --default-character-set=utf8mb4 -hlocalhost mijung < {파일경로}\insertingredient.sql
  ```