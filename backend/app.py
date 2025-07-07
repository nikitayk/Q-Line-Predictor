from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return "✅ Backend is working!"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input data from frontend
        data = request.get_json()

        # Example: get values from JSON body
        age = data.get('age', 0)
        queue_length = data.get('queue_length', 0)

        # Example prediction logic (replace this with ML model)
        wait_time = queue_length * 2 + age * 0.5  # dummy formula

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

