## 목차

- [버전 정보](#버전-정보)
- [환경변수](#환경변수)
  - [frontend .env](#frontend-env)
  - [backend .env](#backend-env)
  - [fastapi .evn](#fastapi-evn)
- [배포 시 주의사항](#배포-시-주의사항)
- [시나리오](#시나리오)
  - [메인](#메인)
  - [식재료-디테일](#식재료-디테일)
  - [식재료-네트워크그래프](#식재료-네트워크그래프)
  - [식재료-리스트](#식재료-리스트)
  - [식재료-추천](#식재료-추천)
  - [레시피-추천](#레시피-추천)
  - [레시피-리스트](#레시피-리스트)
  - [레시피-리스트및찜](#레시피-리스트및찜)
  - [레시피-디테일2식재료디테일](#레시피-디테일2식재료디테일)
  - [레시피-알람](#레시피-알람)

<br>

# 버전 정보

- Intellij 버전정보 넣어주세요
- Vscode 1.90.2
- Node 20.15.0
- npm 10.7.0
- MySQL 8.4.1
- SpringBoot 버전정보 넣어주세요
- JPA 버전정보 넣어주세요
- Nginx 1.27.2
- Ubuntu 22.04 LTS
- docker 27.2.0

---

# 환경변수

## frontend .env

```json
{/* .env */ }
VITE_APP_DEV_URL=로컬 환경에서 접근 할 데이터 요청 경로
VITE_APP_PRODUCT_URL=EC2 환경에서 접근 할 API Server

VITE_DEV_BACKEND_API_URL=로컬 환경에서 접근 할 API Server (spring boot)
VITE_PROD_BACKEND_API_URL=EC2 환경에서 접근 할 API Server (spring boot)

VITE_PROD_FAST_API_URL=EC2 환경에서 접근 할 API Server (fast api)

# Spring API를 통한 식재료 추천 (Spark사용)
VITE_PROD_INGREDIENT_API_URL=EC2 환경에서 접근 할 API Server (spring boot - spark)
```

## backend .env

```
MYSQL_HOST = DB 서버의 호스트 주소
MYSQL_PORT = MySQL 서버가 사용하는 포트번호. Default :3306
MYSQL_DB = 연결할 MySQL 데이터베이스의 이름
MYSQL_USER = MySQL 데이터베이스에 접속할 사용자 이름
MYSQL_PASSWORD = 해당 사용자의 비밀번호
CORS_URL = Local 환경에서 CORS 에러 임시 제거
DDL_AUTO_OPTION = ==소연님 추가해주세요 소연님 추가해주세요 소연님 추가해주세요==
FPGROWTH_MODEL_PATH = ==소연님 추가해주세요 소연님 추가해주세요 소연님 추가해주세요==
```

## fastapi .evn

```
MYSQL_HOST = DB 서버의 호스트 주소
MYSQL_PORT = MySQL 서버가 사용하는 포트번호. Default :3306
MYSQL_DB = 연결할 MySQL 데이터베이스의 이름
MYSQL_USER = MySQL 데이터베이스에 접속할 사용자 이름
MYSQL_PASSWORD = 해당 사용자의 비밀번호

KAMIS_KEY: KAMIS 식재료 가격 정보를 불러오기 위한 키 값
KAMIS_ID: KAMIS 식재료 가격 정보를 불러오기 위한 ID 값

CORS_URL: Local 환경에서 CORS 에러 임시 제거
JAVA_HOME: Fastapi에서 사용할, 이미지에 설치된 자바의 경로
SPARK_ENV: 개발 환경 구분을 위한 변수
SPARK_URL: spark 요청 경로
HADOOP_URL: 하둡 요청 경로
BASIC_PATH: Embedding 파일 기본 경로
CSV_FILE: Embedding 파일명
EMBEDDING_MODEL: Embedding 모델 파일명
RECIPE_MODEL: Recipe 모델 파일명
```

---

# 배포 시 주의사항

- certbot을 통해서 HTTPS 인증서를 발급받아야 합니다.
- KAMIS 요청을 위한 KEY 값을 발급받아야 합니다.

---

# 시나리오

### 메인

![메인](https://lab.ssafy.com/s11-bigdata-dist-sub1/S11P21D107/uploads/4ca0165b23d1b443b8e0d5489f025d9a/%EB%AA%A8%EB%B0%94%EC%9D%BC-%EC%B4%88%EA%B8%B0%EC%A0%91%EC%86%8D.mp4)

### 식재료-디테일

![식재료-디테일](https://lab.ssafy.com/s11-bigdata-dist-sub1/S11P21D107/uploads/03b592219e4781ee700c1940414437b6/%EB%AA%A8%EB%B0%94%EC%9D%BC-%EC%A0%91%EC%86%8D2%EC%8B%9D%EC%9E%AC%EB%A3%8C%EB%94%94%ED%85%8C%EC%9D%BC.mp4)

### 식재료-네트워크그래프

![식재료-네트워크그래프](https://lab.ssafy.com/s11-bigdata-dist-sub1/S11P21D107/uploads/3e6ba012c776a76d3894ed021c3e718a/%EB%AA%A8%EB%B0%94%EC%9D%BC-%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC%EA%B7%B8%EB%9E%98%ED%94%84.mp4)

### 식재료-리스트

![식재료-리스트](https://lab.ssafy.com/s11-bigdata-dist-sub1/S11P21D107/uploads/1b624e83ac075429f03b0bf9a5803ff3/%EB%AA%A8%EB%B0%94%EC%9D%BC-%EC%8B%9D%EC%9E%AC%EB%A3%8C%EB%A6%AC%EC%8A%A4%ED%8A%B8.mp4)

### 식재료-추천

![식재료-추천](https://lab.ssafy.com/s11-bigdata-dist-sub1/S11P21D107/uploads/141fc3f8a43134572a58cc0a4b4b4b57/%EB%AA%A8%EB%B0%94%EC%9D%BC-%EC%8B%9D%EC%9E%AC%EB%A3%8C%EC%B6%94%EC%B2%9C.mp4)

### 레시피-추천

![레시피-추천](https://lab.ssafy.com/s11-bigdata-dist-sub1/S11P21D107/uploads/cb9042df2bb9c6d04756807b2fb1fef1/%EB%AA%A8%EB%B0%94%EC%9D%BC-%EB%A0%88%EC%8B%9C%ED%94%BC%EC%B6%94%EC%B2%9C.mp4)

### 레시피-리스트

![레시피-리스트](https://lab.ssafy.com/s11-bigdata-dist-sub1/S11P21D107/uploads/d80af4b78e5dee2d1162699070cf53b1/%EB%AA%A8%EB%B0%94%EC%9D%BC-%EB%A0%88%EC%8B%9C%ED%94%BC%EB%A6%AC%EC%8A%A4%ED%8A%B8.mp4)

### 레시피-리스트및찜

![레시피-리스트및찜](https://lab.ssafy.com/s11-bigdata-dist-sub1/S11P21D107/uploads/64e3bdc8e619c29b4fb40121c706e878/%EB%AA%A8%EB%B0%94%EC%9D%BC-%EB%A0%88%EC%8B%9C%ED%94%BC%EB%A6%AC%EC%8A%A4%ED%8A%B8%EB%B0%8F%EC%B0%9C.mp4)

### 레시피-디테일2식재료디테일

![레시피-디테일2식재료디테일](https://lab.ssafy.com/s11-bigdata-dist-sub1/S11P21D107/uploads/6eb3f994cc7af7414034236e6c754b38/%EB%AA%A8%EB%B0%94%EC%9D%BC-%EB%A0%88%EC%8B%9C%ED%94%BC%EB%94%94%ED%85%8C%EC%9D%BC2%EC%8B%9D%EC%9E%AC%EB%A3%8C%EB%94%94%ED%85%8C%EC%9D%BC.mp4)

### 레시피-알람

![레시피-알람](https://lab.ssafy.com/s11-bigdata-dist-sub1/S11P21D107/uploads/95c8447fde4f3fec58dc7969b8a2d00f/%EB%AA%A8%EB%B0%94%EC%9D%BC-%EB%A0%88%EC%8B%9C%ED%94%BC%EC%95%8C%EB%9E%8C.mp4)

---
