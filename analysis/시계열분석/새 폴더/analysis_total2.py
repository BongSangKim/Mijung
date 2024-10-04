import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Embedding, LSTM, Dense, Concatenate, Lambda
from tensorflow.keras.optimizers import Adam
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt
import logging
import joblib
from tensorflow.keras.models import load_model

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def save_model_and_scaler(model, scaler, model_path, scaler_path):
    logging.info("모델 및 스케일러 저장 시작")
    model.save(model_path)
    joblib.dump(scaler, scaler_path)
    logging.info(f"모델 저장 완료: {model_path}")
    logging.info(f"스케일러 저장 완료: {scaler_path}")

def load_model_and_scaler(model_path, scaler_path):
    logging.info("모델 및 스케일러 로드 시작")
    model = load_model(model_path)
    scaler = joblib.load(scaler_path)
    logging.info(f"모델 로드 완료: {model_path}")
    logging.info(f"스케일러 로드 완료: {scaler_path}")
    return model, scaler

def load_and_preprocess_data(file_path):
    logging.info("데이터 로딩 및 전처리 시작")
    df = pd.read_excel(file_path)
    df['date'] = pd.to_datetime(df['date'])
    df['item_code'] = df['item_code'].astype('category')
    
    # 결측치 처리
    df['price'] = df['price'].replace('-', np.nan)
    df['price'] = df['price'].str.replace(',', '').astype(float)
    
    # 단위 정규화 (예: 모든 가격을 kg 단위로 변환)
    unit_multipliers = {'20kg': 1, '1kg': 20, '500g': 40, '100g': 200}
    df['price'] = df.apply(lambda row: row['price'] * unit_multipliers.get(row['unit'], 1), axis=1)
    
    # 결측치 보간
    df = df.set_index('date').groupby('item_code')['price'].resample('D').mean().reset_index()
    df['price'] = df.groupby('item_code')['price'].fillna(method='ffill').fillna(method='bfill')
    
    # 품목 코드 인코딩
    df['item_code'] = df['item_code'].cat.codes.astype('int32')
    
    logging.info(f"데이터 로딩 완료. 행 수: {len(df)}, 열 수: {df.shape[1]}")
    return df

def create_sequences(data, seq_length):
    logging.info("시퀀스 생성 시작")
    X, y = [], []
    for item in data['item_code'].unique():
        item_data = data[data['item_code'] == item].sort_values('date')
        if len(item_data) > seq_length:
            item_sequences = item_data['price'].values
            for i in range(len(item_sequences) - seq_length):
                X.append([item, item_sequences[i:i+seq_length]])
                y.append(item_sequences[i+seq_length])
    
    X = np.array(X, dtype=object)
    y = np.array(y, dtype=np.float32)
    logging.info(f"시퀀스 생성 완료. X shape: {X.shape}, y shape: {y.shape}")
    return X, y

def build_model(num_items, seq_length, embedding_dim=50):
    logging.info("모델 구축 시작")
    item_input = Input(shape=(1,))
    price_input = Input(shape=(seq_length, 1))

    item_embedding = Embedding(num_items, embedding_dim)(item_input)
    item_embedding = Lambda(lambda x: tf.squeeze(x, axis=1))(item_embedding)

    lstm = LSTM(100, return_sequences=True)(price_input)
    lstm = LSTM(50)(lstm)

    concat = Concatenate()([item_embedding, lstm])
    dense = Dense(50, activation='relu')(concat)
    dense = Dense(25, activation='relu')(dense)
    output = Dense(1)(dense)

    model = Model(inputs=[item_input, price_input], outputs=output)
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
    logging.info("모델 구축 완료")
    return model

def train_model(model, X, y, epochs=100, batch_size=32):
    logging.info("모델 훈련 시작")
    X_item = np.array(X[:, 0], dtype=np.int32)
    X_price = np.array([np.array(x, dtype=np.float32) for x in X[:, 1]])
    
    # 가격 데이터 스케일링
    scaler = MinMaxScaler()
    X_price_scaled = scaler.fit_transform(X_price.reshape(-1, 1)).reshape(X_price.shape)
    y_scaled = scaler.transform(y.reshape(-1, 1)).flatten()
    
    history = model.fit(
        [X_item, X_price_scaled.reshape(-1, X_price.shape[1], 1)],
        y_scaled,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=0.2,
        verbose=1
    )
    logging.info("모델 훈련 완료")
    return history, scaler

def predict_future(model, X_last, scaler, num_days=30):
    predictions = []
    current_sequence = X_last[1].copy()
    item_code = X_last[0]
    
    for _ in range(num_days):
        scaled_sequence = scaler.transform(current_sequence.reshape(-1, 1)).reshape(1, -1, 1)
        pred_scaled = model.predict([np.array([item_code]), scaled_sequence])
        pred = scaler.inverse_transform(pred_scaled)[0][0]
        predictions.append(pred)
        current_sequence = np.roll(current_sequence, -1)
        current_sequence[-1] = pred
    
    return predictions

if __name__ == "__main__":
    file_path = r"C:\Users\SSAFY\Desktop\분석\시계열분석\test\data.xlsx"
    df = load_and_preprocess_data(file_path)
    seq_length = 60
    X, y = create_sequences(df, seq_length)

    num_items = df['item_code'].nunique()
    model = build_model(num_items, seq_length)

    # 데이터의 일부만 사용하여 테스트 (메모리 문제 방지)
    X_train, y_train = X[:10000], y[:10000]
    history, scaler = train_model(model, X_train, y_train, epochs=100, batch_size=32)

    # 모델 및 스케일러 저장
    model_path = 'price_prediction_model.h5'
    scaler_path = 'price_scaler.pkl'
    save_model_and_scaler(model, scaler, model_path, scaler_path)

    plt.figure(figsize=(12, 6))
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Model Loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend()
    plt.show()

    # 미래 30일 예측
    test_item = X[-1]  # 마지막 시퀀스 사용
    future_predictions = predict_future(model, test_item, scaler)

    plt.figure(figsize=(12, 6))
    plt.plot(range(seq_length), test_item[1], label='Historical Data')
    plt.plot(range(seq_length-1, seq_length+30), [test_item[1][-1]] + future_predictions, label='Predictions')
    plt.title(f'Price Prediction for Item {test_item[0]}')
    plt.xlabel('Days')
    plt.ylabel('Price')
    plt.legend()
    plt.show()

    logging.info("프로그램 실행 완료")