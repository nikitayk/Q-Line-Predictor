from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allows frontend to access backend

@app.route('/')
def home():
    return "✅ Backend is working!"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        queue_length = int(data.get('current_queue_length', 0))
        counters = max(int(data.get('number_of_active_counters', 1)), 1)
        service_time = float(data.get('average_service_time_per_customer', 1.0))
        is_rush_hour = bool(data.get('is_rush_hour', False))
        is_weekend = bool(data.get('is_weekend', False))

        # Basic prediction formula
        wait_time = (queue_length / counters) * service_time
        if is_rush_hour:
            wait_time *= 1.3
        if is_weekend:
            wait_time *= 1.2

        wait_time = round(wait_time, 1)

        return jsonify({
            'predicted_wait_time': wait_time,
            'status': 'success'
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
