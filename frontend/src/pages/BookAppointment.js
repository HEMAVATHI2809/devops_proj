import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import api from '../services/api';

const BookAppointment = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/services/${serviceId}`);
        // Backend returns { service }
        setService(response.data.service);
      } catch (error) {
        console.error('Error fetching service:', error);
        setToast({ message: 'Service not found', type: 'error' });
        setTimeout(() => navigate('/customer-dashboard'), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId, navigate]);

  const toLocalYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getAvailableDates = () => {
    if (!service) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dates = [];
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30); // Next 30 days

    for (let d = new Date(today); d <= maxDate; d.setDate(d.getDate() + 1)) {
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      if ((service.availableDays || []).includes(dayName)) {
        dates.push(new Date(d));
      }
    }
    
    return dates;
  };

  const getAvailableTimeSlots = () => {
    if (!service || !selectedDate) return [];
    return service.availableTimeSlots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTimeSlot) {
      setToast({ message: 'Please select both date and time slot', type: 'error' });
      return;
    }

    setBooking(true);

    try {
      await api.post('/appointments', {
        serviceId: serviceId,
        date: selectedDate,
        timeSlot: selectedTimeSlot
      });

      setToast({ message: 'Booking created (pending). Redirecting to your dashboard…', type: 'success' });
      setBooking(false);
      setTimeout(() => navigate('/customer-dashboard'), 800);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setToast({
        message: error.response?.data?.message || 'Failed to create booking',
        type: 'error'
      });
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Service not found</p>
        </div>
      </div>
    );
  }

  const availableDates = getAvailableDates();
  const availableTimeSlots = getAvailableTimeSlots();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Book Appointment
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {service.name} with {service.providerId?.businessName || service.providerId?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Service Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    {service.name}
                  </h3>
                  
                  <div className="price-box mb-4">
                    <h3>Appointment Fee</h3>
                    <p>₹{service.appointmentFee || 0}</p>
                  </div>

                  <div className="flex gap-4 mb-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {service.category}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Provider
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {service.providerId?.businessName || service.providerId?.name}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Available Days
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {service.availableDays.map((day, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Select Date & Time
              </h2>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Date
                </label>
                
                {availableDates.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300">
                    No available dates in the next 30 days.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {availableDates.map((date) => (
                      <button
                        key={toLocalYMD(date)}
                        type="button"
                        onClick={() => {
                          setSelectedDate(toLocalYMD(date));
                          setSelectedTimeSlot(''); // Reset time slot when date changes
                        }}
                        className={`p-3 text-center rounded-lg border transition-colors ${
                          selectedDate === toLocalYMD(date)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-sm font-semibold">
                          {date.getDate()}
                        </div>
                        <div className="text-xs">
                          {date.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Time Slot Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Time Slot
                </label>
                
                {!selectedDate ? (
                  <p className="text-gray-600 dark:text-gray-300">
                    Please select a date first.
                  </p>
                ) : availableTimeSlots.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300">
                    No available time slots for the selected date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-3 text-center rounded-lg border transition-colors ${
                          selectedTimeSlot === slot
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Booking Summary */}
              {selectedDate && selectedTimeSlot && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Booking Summary
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p>Service: {service.name}</p>
                    <p>Provider: {service.providerId?.businessName || service.providerId?.name}</p>
                    <p className="font-semibold text-primary-600 dark:text-primary-400 mt-2">
                      Price: ₹{service.price}
                    </p>
                    <p>Date: {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p>Time: {selectedTimeSlot}</p>
                    <p>Customer: {user?.name}</p>
                    <p>Email: {user?.email}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedDate || !selectedTimeSlot || booking}
                  className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {booking ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Booking...
                    </div>
                  ) : (
                    'Submit booking'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
};

export default BookAppointment;
