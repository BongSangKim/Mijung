import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import font_manager, rc
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.optimizers import Adam
from tensorflow.keras import Input

# 한글 폰트 설정
font_path = "C:/Windows/Fonts/malgun.ttf"
font = font_manager.FontProperties(fname=font_path).get_name()
rc('font', family=font)
plt.rcParams['axes.unicode_minus'] = False

# 데이터 로딩 함수
def load_data(file_path, item_name):
    data = pd.read_excel(file_path)
    data['price'] = data['price'].replace('-', np.nan)
    data['price'] = data['price'].str.replace(',', '').astype(float)
    data = data.dropna(subset=['price'])
    data['date'] = pd.to_datetime(data['date'], errors='coerce')
    data = data[data['item_name'] == item_name]
    data.set_index('date', inplace=True)
    return data['price'].sort_index()

# 데이터 전처리 함수
def preprocess_data(data, look_back=120):
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data.values.reshape(-1, 1))
    X, y = [], []
    for i in range(len(scaled_data) - look_back):
        X.append(scaled_data[i:(i + look_back), 0])
        y.append(scaled_data[i + look_back, 0])
    return np.array(X), np.array(y), scaler

# LSTM 모델 생성 함수
def create_model(look_back):
    model = Sequential([
        Input(shape=(look_back, 1)),
        LSTM(100, activation='relu', return_sequences=True),
        LSTM(100, activation='relu'),
        Dense(50, activation='relu'),
        Dense(1)
    ])
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
    return model

# 메인 실행 코드
if __name__ == "__main__":
    file_path = "C:/Users/SSAFY/Desktop/분석/시계열분석/test/data.xlsx"
    item_name = '감자'
    price_data = load_data(file_path, item_name)
    
    look_back = 120  # 4개월(약 120일)의 데이터를 기반으로 예측
    X, y, scaler = preprocess_data(price_data, look_back)
    model = create_model(look_back)
    model.fit(X, y, epochs=200, batch_size=32, validation_split=0.2, verbose=1)

    # 스케일링 확인
    print("Data range after scaling (min, max):", scaler.data_min_, scaler.data_max_)

    # 마지막 날짜로부터 한 달(30일) 예측
    last_sequence = price_data[-look_back:].values.reshape(-1, 1)
    last_sequence_scaled = scaler.transform(last_sequence)
    predictions = []
    for _ in range(30):  # 30일 예측
        next_pred = model.predict(last_sequence_scaled.reshape(1, look_back, 1))
        predictions.append(next_pred[0, 0])
        last_sequence = np.append(last_sequence[1:], scaler.inverse_transform(next_pred))
        last_sequence_scaled = scaler.transform(last_sequence.reshape(-1, 1))

    predictions = np.array(predictions).reshape(-1, 1)
    predictions = scaler.inverse_transform(predictions)

    # 예측 날짜 생성
    last_date = price_data.index[-1]
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=30)

    # 예측값 출력
    print("Predictions for the next 30 days:")
    for date, pred in zip(future_dates, predictions):
        print(f"{date.date()}: {pred[0]:.2f}")

    # 그래프 그리기
    plt.figure(figsize=(12, 6))
    plt.plot(price_data.index, price_data, label='Historical Price', color='blue')
    plt.plot(future_dates, predictions, label='Predicted Price', color='red', linestyle='--')
    plt.title(f'{item_name} 가격: 향후 30일 예측 (LSTM)')
    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.legend()
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

    # 예측 신뢰구간 계산 (예시: 표준편차의 2배를 사용)
    std_dev = np.std(price_data[-30:])  # 최근 30일의 표준편차 사용
    confidence_interval = 2 * std_dev

    # 신뢰구간을 포함한 그래프 그리기
    plt.figure(figsize=(12, 6))
    plt.plot(price_data.index, price_data, label='Historical Price', color='blue')
    plt.plot(future_dates, predictions, label='Predicted Price', color='red', linestyle='--')
    plt.fill_between(future_dates, 
                     (predictions - confidence_interval).flatten(), 
                     (predictions + confidence_interval).flatten(), 
                     color='red', alpha=0.2, label='Confidence Interval')
    plt.title(f'{item_name} 가격: 향후 30일 예측 및 신뢰구간 (LSTM)')
    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.legend()
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()