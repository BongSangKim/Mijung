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
    
    history = model.fit(
        [X_item, X_price.reshape(-1, X_price.shape[1], 1)],
        y,
        epochs=epochs,
        batch_size=batch_size,
        validation_split=0.2,
        verbose=1
    )
    logging.info("모델 훈련 완료")
    return history

def predict_future(model, X_last, num_days=30):
    predictions = []
    current_sequence = X_last[1].copy()
    item_code = X_last[0]
    
    for _ in range(num_days):
        pred = model.predict([np.array([item_code]), current_sequence.reshape(1, -1, 1)])
        predictions.append(pred[0][0])
        current_sequence = np.roll(current_sequence, -1)
        current_sequence[-1] = pred[0][0]
    
    return predictions

def predict_and_save(model, X, item_codes, num_days=30):
    predictions = {}
    for item_code in item_codes:
        item_data = X[X[:, 0] == item_code]
        if len(item_data) > 0:
            last_sequence = item_data[-1]
            pred = predict_future(model, last_sequence, num_days)
            predictions[item_code] = pred
    
    # 예측 결과 저장
    pd.DataFrame(predictions).to_csv('predictions.csv')
    logging.info("예측 결과 저장 완료: predictions.csv")
    return predictions

def visualize_predictions(X, predictions, item_codes):
    plt.figure(figsize=(15, 10))
    for i, item_code in enumerate(item_codes, 1):
        plt.subplot(3, 3, i)
        item_data = X[X[:, 0] == item_code]
        if len(item_data) > 0:
            historical_data = item_data[-1, 1]
            plt.plot(range(len(historical_data)), historical_data, label='Historical')
            plt.plot(range(len(historical_data)-1, len(historical_data)+len(predictions[item_code])),
                     [historical_data[-1]] + predictions[item_code], label='Prediction')
            plt.title(f'Item {item_code}')
            plt.legend()
    plt.tight_layout()
    plt.savefig('predictions_plot.png')
    plt.close()
    logging.info("예측 그래프 저장 완료: predictions_plot.png")

if __name__ == "__main__":
    file_path = r"C:\Users\SSAFY\Desktop\분석\시계열분석\test\data.xlsx"
    df = load_and_preprocess_data(file_path)
    seq_length = 60
    X, y = create_sequences(df, seq_length)

    num_items = df['item_code'].nunique()
    model = build_model(num_items, seq_length)

    history = train_model(model, X, y, epochs=100, batch_size=32)

    # 모델 및 스케일러 저장
    model_path = 'price_prediction_model.h5'
    save_model_and_scaler(model, None, model_path, None)

    plt.figure(figsize=(10, 6))
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Model Loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend()
    plt.savefig('model_loss.png')
    plt.close()
    logging.info("모델 손실 그래프 저장 완료: model_loss.png")

    # 미래 30일 예측
    item_codes = [111, 112, 141, 142, 143, 151, 152]
    predictions = predict_and_save(model, X, item_codes)

    visualize_predictions(X, predictions, item_codes)

    logging.info("프로그램 실행 완료")