import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Input
from tensorflow.keras.optimizers import Adam
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import os
import tensorflow as tf

def load_data(file_path, item_name, ma_periods=[7, 30, 90]):
    data = pd.read_excel(file_path)
    data['price'] = data['price'].replace('-', np.nan)
    data['price'] = data['price'].str.replace(',', '').astype(float)
    data = data.dropna(subset=['price'])
    data['date'] = pd.to_datetime(data['date'], errors='coerce')
    data = data[data['item_name'] == item_name].sort_values('date')
    data.set_index('date', inplace=True)
    
    data = data[['price']]

    for period in ma_periods:
        data[f'MA_{period}'] = data['price'].rolling(window=period).mean()
    
    return data.dropna()

def preprocess_data(data, look_back=60):
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)
    
    X, y = [], []
    for i in range(len(scaled_data) - look_back):
        X.append(scaled_data[i:(i + look_back), :])
        y.append(scaled_data[i + look_back, 0])
    
    return np.array(X), np.array(y), scaler

def create_model(input_shape):
    model = Sequential([
        Input(shape=input_shape),
        LSTM(100, activation='relu', return_sequences=True),
        LSTM(100, activation='relu'),
        Dense(50, activation='relu'),
        Dense(1)
    ])
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
    return model

def evaluate_model(y_true, y_pred):
    mse = mean_squared_error(y_true, y_pred)
    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    return mse, mae, r2

def train_and_evaluate(X, y, scaler, period_name):
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]
    
    model_path = f'model_{period_name.replace(" ", "_").lower()}.h5'
    
    if os.path.exists(model_path):
        print(f"Loading existing model for {period_name}")
        model = load_model(model_path)
    else:
        print(f"Training new model for {period_name}")
        model = create_model((X.shape[1], X.shape[2]))
        history = model.fit(X_train, y_train, epochs=100, batch_size=32, 
                            validation_split=0.2, verbose=1)
        model.save(model_path)
        
        # 학습 과정 시각화
        plt.figure(figsize=(10, 6))
        plt.plot(history.history['loss'], label='Training Loss')
        plt.plot(history.history['val_loss'], label='Validation Loss')
        plt.title(f'Model Loss for {period_name}')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend()
        plt.show()
    
    train_predict = model.predict(X_train)
    test_predict = model.predict(X_test)
    
    train_predict = scaler.inverse_transform(np.concatenate([train_predict, np.zeros((len(train_predict), X.shape[2]-1))], axis=1))[:, 0]
    test_predict = scaler.inverse_transform(np.concatenate([test_predict, np.zeros((len(test_predict), X.shape[2]-1))], axis=1))[:, 0]
    y_train_actual = scaler.inverse_transform(np.concatenate([y_train.reshape(-1, 1), np.zeros((len(y_train), X.shape[2]-1))], axis=1))[:, 0]
    y_test_actual = scaler.inverse_transform(np.concatenate([y_test.reshape(-1, 1), np.zeros((len(y_test), X.shape[2]-1))], axis=1))[:, 0]
    
    train_mse, train_mae, train_r2 = evaluate_model(y_train_actual, train_predict)
    test_mse, test_mae, test_r2 = evaluate_model(y_test_actual, test_predict)
    
    print(f"\n--- Results for {period_name} ---")
    print(f"Train MSE: {train_mse:.2f}, MAE: {train_mae:.2f}, R2: {train_r2:.4f}")
    print(f"Test MSE: {test_mse:.2f}, MAE: {test_mae:.2f}, R2: {test_r2:.4f}")
    
    return model, test_predict, y_test_actual

if __name__ == "__main__":
    file_path = "C:/Users/SSAFY/Desktop/분석/시계열분석/test/data.xlsx"
    item_name = '쌀'
    full_data = load_data(file_path, item_name)
    
    end_date = full_data.index[-1]
    periods = [
        ("Full Data", full_data),
        ("Last 5 Years", full_data.loc[end_date - pd.DateOffset(years=5):]),
        ("Last 3 Years", full_data.loc[end_date - pd.DateOffset(years=3):]),
        ("Last 1 Year", full_data.loc[end_date - pd.DateOffset(years=1):])
    ]
    
    results = []
    for i, (period_name, data) in enumerate(periods):
        print(f"\nProcessing {period_name} ({i+1}/{len(periods)})")
        X, y, scaler = preprocess_data(data)
        model, test_pred, test_actual = train_and_evaluate(X, y, scaler, period_name)
        results.append((period_name, model, test_pred, test_actual, data.index[len(data)-len(test_actual):]))
        print(f"Completed {period_name}")
    
    # 결과 시각화
    plt.figure(figsize=(15, 10))
    for i, (period_name, _, test_pred, test_actual, dates) in enumerate(results):
        plt.subplot(2, 2, i+1)
        plt.plot(dates, test_actual, label='Actual')
        plt.plot(dates, test_pred, label='Predicted')
        plt.title(f'{period_name} - Test Set Predictions')
        plt.xlabel('Date')
        plt.ylabel('Price')
        plt.legend()
    plt.tight_layout()
    plt.show()

# 저장된 모델을 사용하여 새로운 데이터에 대한 예측을 수행하는 예시
def predict_future(model_path, new_data, scaler, look_back=60):
    model = load_model(model_path)
    scaled_data = scaler.transform(new_data)
    
    X = []
    for i in range(len(scaled_data) - look_back):
        X.append(scaled_data[i:(i + look_back), :])
    X = np.array(X)
    
    predictions = model.predict(X)
    predictions = scaler.inverse_transform(np.concatenate([predictions, np.zeros((len(predictions), new_data.shape[1]-1))], axis=1))[:, 0]
    
    return predictions

# 새로운 데이터에 대한 예측 예시
new_data = full_data.loc[end_date - pd.DateOffset(months=2):]  # 최근 2개월 데이터
X, _, scaler = preprocess_data(new_data)
future_pred = predict_future('model_full_data.h5', new_data, scaler)

plt.figure(figsize=(10, 6))
plt.plot(new_data.index[60:], new_data['price'].values[60:], label='Actual')
plt.plot(new_data.index[60:], future_pred, label='Predicted')
plt.title('Future Predictions using Saved Model')
plt.xlabel('Date')
plt.ylabel('Price')
plt.legend()
plt.show()