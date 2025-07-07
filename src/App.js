import React, { useState, useEffect } from 'react';
import { Clock, Users, Timer, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import './index.css';

const QLineWaitTimePredictor = () => {
  const [formData, setFormData] = useState({
    current_queue_length: 5,
    number_of_active_counters: 2,
    average_service_time_per_customer: 4.0,
    time_of_day: '14:30',
    day_of_week: 1,
    is_weekend: false,
    is_rush_hour: false
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Auto-detect weekend and rush hour
  useEffect(() => {
    const dayIndex = parseInt(formData.day_of_week);
    const isWeekend = dayIndex >= 5;
    
    // Parse time to detect rush hour
    const [hour, minute] = formData.time_of_day.split(':').map(Number);
    const isRushHour = (hour >= 8 && hour <= 10) || 
                      (hour >= 12 && hour <= 14) || 
                      (hour >= 17 && hour <= 19);

    setFormData(prev => ({
      ...prev,
      is_weekend: isWeekend,
      is_rush_hour: isRushHour
    }));
  }, [formData.day_of_week, formData.time_of_day]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const predictWaitTime = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert form data to API format
      const apiData = {
        current_queue_length: parseInt(formData.current_queue_length),
        number_of_active_counters: parseInt(formData.number_of_active_counters),
        average_service_time_per_customer: parseFloat(formData.average_service_time_per_customer),
        time_of_day: formData.time_of_day,
        day_of_week: parseInt(formData.day_of_week),
        is_weekend: formData.is_weekend,
        is_rush_hour: formData.is_rush_hour
      };

      console.log('Sending API request:', apiData);

      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.status === 'success') {
        setPrediction(data.predicted_wait_time);
        setDemoMode(false);
      } else {
        setError(data.error || 'Prediction failed');
      }
    } catch (err) {
      console.error('Prediction error:', err);
      if (err.message.includes('Failed to fetch')) {
        // Fallback to demo mode with simple calculation
        const demoWaitTime = calculateDemoWaitTime();
        setPrediction(demoWaitTime);
        setDemoMode(true);
        setError('Using demo mode - backend not available');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateDemoWaitTime = () => {
    // Simple demo calculation when backend is not available
    const queueLength = parseInt(formData.current_queue_length);
    const activeCounters = parseInt(formData.number_of_active_counters);
    const serviceTime = parseFloat(formData.average_service_time_per_customer);
    
    let waitTime = (queueLength / activeCounters) * serviceTime;
    
    // Add modifiers for rush hour and weekend
    if (formData.is_rush_hour) waitTime *= 1.3;
    if (formData.is_weekend) waitTime *= 1.2;
    
    return Math.max(0, Math.round(waitTime * 10) / 10);
  };

  const getWaitTimeColor = (minutes) => {
    if (minutes <= 5) return 'text-green-600';
    if (minutes <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWaitTimeStatus = (minutes) => {
    if (minutes <= 5) return 'Short wait';
    if (minutes <= 15) return 'Moderate wait';
    return 'Long wait';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Q-Line Wait Time Predictor</h1>
        <p className="text-gray-600">Smart queue management for small retail shops</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Timer className="mr-2 text-blue-600" size={20} />
            Current Queue Status
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Users className="inline mr-1" size={16} />
                Current Queue Length
              </label>
              <input
                type="number"
                name="current_queue_length"
                value={formData.current_queue_length}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Active Counters
              </label>
              <input
                type="number"
                name="number_of_active_counters"
                value={formData.number_of_active_counters}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="inline mr-1" size={16} />
                Avg Service Time (minutes)
              </label>
              <input
                type="number"
                name="average_service_time_per_customer"
                value={formData.average_service_time_per_customer}
                onChange={handleInputChange}
                min="1"
                max="20"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Time
              </label>
              <input
                type="time"
                name="time_of_day"
                value={formData.time_of_day}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline mr-1" size={16} />
                Day of Week
              </label>
              <select
                name="day_of_week"
                value={formData.day_of_week}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {daysOfWeek.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_weekend"
                  checked={formData.is_weekend}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Weekend</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_rush_hour"
                  checked={formData.is_rush_hour}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Rush Hour</span>
              </label>
            </div>

            <button
              onClick={predictWaitTime}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Predicting...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2" size={16} />
                  Predict Wait Time
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prediction Results */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Prediction Results</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="text-red-600 mr-2" size={20} />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {prediction !== null && (
            <div className="text-center">
              {demoMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <div className="flex items-center justify-center">
                    <AlertCircle className="text-yellow-600 mr-2" size={16} />
                    <span className="text-yellow-700 text-sm">Demo Mode - Start backend for ML predictions</span>
                  </div>
                </div>
              )}
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="mb-4">
                  <div className={`text-4xl font-bold ${getWaitTimeColor(prediction)}`}>
                    {prediction}
                  </div>
                  <div className="text-gray-600 text-sm">minutes</div>
                </div>
                
                <div className={`text-lg font-medium ${getWaitTimeColor(prediction)}`}>
                  {getWaitTimeStatus(prediction)}
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  Estimated wait time for next customer
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">Queue Length</div>
                  <div className="font-semibold">{formData.current_queue_length}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">Active Counters</div>
                  <div className="font-semibold">{formData.number_of_active_counters}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">Service Time</div>
                  <div className="font-semibold">{formData.average_service_time_per_customer}min</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">Time</div>
                  <div className="font-semibold">{formData.time_of_day}</div>
                </div>
              </div>
            </div>
          )}

          {prediction === null && !error && (
            <div className="text-center text-gray-500 py-8">
              <Clock size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Enter queue details and click "Predict Wait Time" to get an estimate</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How it works:</h3>
        <p className="text-sm text-blue-700">
          Our AI model analyzes current queue conditions, time patterns, and historical data to predict wait times. 
          The system considers factors like rush hours, weekends, and service efficiency to provide accurate estimates.
        </p>
      </div>
    </div>
  );
};

export default QLineWaitTimePredictor;