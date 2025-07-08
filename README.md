# 🕒 Q-Line: Smart Queue Wait Time Predictor

> A lightweight, ML-powered queue management system built for small retail shops to predict real-time customer wait times.

## 🚀 Overview

**Q-Line** is an intelligent queue management solution designed to help small-scale businesses manage customer inflow efficiently. By collecting basic operational inputs from the shopkeeper, it predicts **expected wait times** using a machine learning model. This empowers shops to optimize counters, plan staff allocation, and improve customer satisfaction.

### 🌟 Key Features

- 🔮 Predicts estimated wait time using real-time queue parameters
- 📊 ML-based backend powered by `scikit-learn`
- 🔗 Live API endpoint using `Flask`
- ⚛️ React-based responsive frontend for easy interaction
- 📱 Mobile-friendly, clean, and fast

---

## 🧠 Backend – Wait Time Prediction Model (Python)

### 🔧 Inputs

The model uses a small set of operational parameters to predict wait time (in minutes):

- `current_queue_length` (int): Number of people in the queue
- `number_of_active_counters` (int): How many service counters are running
- `average_service_time_per_customer` (float): Avg service time per customer (in minutes)
- `time_of_day` (int): Time in minutes since midnight (e.g., 14:30 → 870)
- `day_of_week` (str): Day name (e.g., 'Monday')
- `is_weekend` (bool): Whether it's Saturday/Sunday
- `is_rush_hour` (bool): Whether it's peak hour (e.g., 9–11am, 5–8pm)

### ⚙️ Model Details

- Algorithm: `RandomForestRegressor` (configurable to LinearRegression)
- Synthetic data is used for training if real-world data is unavailable
- The trained model is serialized using `joblib`
- The Flask API serves predictions via the `/predict` endpoint

### 🛠️ API – `/predict`

**Method:** `POST`  
**Content-Type:** `application/json`

#### 🔸 Sample Request
```json
{
  "current_queue_length": 10,
  "number_of_active_counters": 2,
  "average_service_time_per_customer": 4.5,
  "time_of_day": 870,
  "day_of_week": "Monday",
  "is_weekend": false,
  "is_rush_hour": true
}
