import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.optimizers import Adam

# 데이터 로딩 및 이동 평균 계산 함수
def load_data(file_path, item_name, ma_periods=[7, 30, 90]):
    data = pd.read_excel(file_path)
    data['price'] = data['price'].replace('-', np.nan)
    data['price'] = data['price'].str.replace(',', '').astype(float)
    data = data.dropna(subset=['price'])
    data['date'] = pd.to_datetime(data['date'], errors='coerce')
    data = data[data['item_name'] == item_name].sort_values('date')
    data.set_index('date', inplace=True)
    
    # 이동 평균 계산
    for period in ma_periods:
        data[f'MA_{period}'] = data['price'].rolling(window=period).mean()
    
    return data.dropna()  # NaN 값 제거 (이동 평균 계산 초기의 NaN)

# 데이터 전처리 함수
def preprocess_data(data, look_back=60):
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)
    
    X, y = [], []
    for i in range(len(scaled_data) - look_back):
        X.append(scaled_data[i:(i + look_back), :])
        y.append(scaled_data[i + look_back, 0])  # 0번째 열이 실제 가격
    
    return np.array(X), np.array(y), scaler

# LSTM 모델 생성 함수
def create_model(input_shape):
    model = Sequential([
        LSTM(100, activation='relu', return_sequences=True, input_shape=input_shape),
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
    data = load_data(file_path, item_name)
    
    look_back = 60  # 2개월의 데이터를 기반으로 예측
    X, y, scaler = preprocess_data(data, look_back)
    
    # 데이터 분할 (80% 훈련, 20% 테스트)
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]
    
    model = create_model((look_back, X.shape[2]))
    model.fit(X_train, y_train, epochs=100, batch_size=32, validation_split=0.2, verbose=1)
    
    # 예측
    train_predict = model.predict(X_train)
    test_predict = model.predict(X_test)
    
    # 역스케일링
    train_predict = scaler.inverse_transform(np.concatenate([train_predict, np.zeros((len(train_predict), X.shape[2]-1))], axis=1))[:, 0]
    test_predict = scaler.inverse_transform(np.concatenate([test_predict, np.zeros((len(test_predict), X.shape[2]-1))], axis=1))[:, 0]
    
    # 결과 시각화
    plt.figure(figsize=(15, 6))
    plt.plot(data.index[look_back:split+look_back], data['price'].values[look_back:split+look_back], label='Actual Price (Train)')
    plt.plot(data.index[split+look_back:], data['price'].values[split+look_back:], label='Actual Price (Test)')
    plt.plot(data.index[look_back:split+look_back], train_predict, label='Predicted Price (Train)')
    plt.plot(data.index[split+look_back:], test_predict, label='Predicted Price (Test)')
    plt.title(f'{item_name} 가격 예측 (LSTM with Moving Averages)')
    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.legend()
    plt.show()

    # 미래 30일 예측
    last_sequence = X[-1]
    future_predictions = []
    for _ in range(30):
        next_pred = model.predict(last_sequence.reshape(1, look_back, -1))
        future_predictions.append(next_pred[0, 0])
        last_sequence = np.roll(last_sequence, -1, axis=0)
        last_sequence[-1] = next_pred

    future_predictions = scaler.inverse_transform(np.concatenate([future_predictions, np.zeros((len(future_predictions), X.shape[2]-1))], axis=1))[:, 0]
    future_dates = pd.date_range(start=data.index[-1] + pd.Timedelta(days=1), periods=30)

    plt.figure(figsize=(15, 6))
    plt.plot(data.index, data['price'], label='Historical Price')
    plt.plot(future_dates, future_predictions, label='Future Predictions', color='red')
    plt.title(f'{item_name} 가격: 향후 30일 예측 (LSTM with Moving Averages)')
    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.legend()
    plt.show()