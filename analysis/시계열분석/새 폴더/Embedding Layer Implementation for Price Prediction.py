import pandas as pd
import numpy as np
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Embedding, LSTM, Dense, Concatenate
from tensorflow.keras.optimizers import Adam
from sklearn.preprocessing import MinMaxScaler

# 데이터 로드 및 전처리
df = pd.read_csv('your_data.csv')
df['date'] = pd.to_datetime(df['date'])
df['item_code'] = df['item_code'].astype('category').cat.codes  # 카테고리 인코딩

# 시퀀스 생성 함수
def create_sequences(data, seq_length):
    X, y = [], []
    for item in data['item_code'].unique():
        item_data = data[data['item_code'] == item].sort_values('date')
        for i in range(len(item_data) - seq_length):
            X.append((item, item_data['price'].iloc[i:i+seq_length].values))
            y.append(item_data['price'].iloc[i+seq_length])
    return np.array(X), np.array(y)

# 시퀀스 생성
seq_length = 60
X, y = create_sequences(df, seq_length)

# 모델 정의
num_items = df['item_code'].nunique()
embedding_dim = 50

item_input = Input(shape=(1,))
price_input = Input(shape=(seq_length, 1))

item_embedding = Embedding(num_items, embedding_dim)(item_input)
item_embedding = tf.squeeze(item_embedding, axis=1)

lstm = LSTM(100)(price_input)

concat = Concatenate()([item_embedding, lstm])
dense = Dense(50, activation='relu')(concat)
output = Dense(1)(dense)

model = Model(inputs=[item_input, price_input], outputs=output)
model.compile(optimizer=Adam(), loss='mse')

# 모델 훈련
model.fit(
    [X[:, 0], X[:, 1].reshape(-1, seq_length, 1)],
    y,
    epochs=100,
    batch_size=32,
    validation_split=0.2
)

# 예측
test_item = 111  # 쌀의 item_code
test_sequence = X[X[:, 0] == test_item][0, 1].reshape(1, seq_length, 1)
prediction = model.predict([np.array([test_item]), test_sequence])
print(f"Predicted price for item {test_item}: {prediction[0][0]}")