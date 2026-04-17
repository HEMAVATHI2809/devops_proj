import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import api from '../services/api';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchService = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/services/${id}`);
      // Handle both response structures: response.data.service or response.data
      const serviceData = response.data.service || response.data;
      
      // Ensure arrays exist with default empty arrays
      if (serviceData) {
        serviceData.availableDays = Array.isArray(serviceData.availableDays) 
          ? serviceData.availableDays 
          : [];
        serviceData.availableTimeSlots = Array.isArray(serviceData.availableTimeSlots) 
          ? serviceData.availableTimeSlots 
          : [];
      }
      
      setService(serviceData);
    } catch (error) {
      console.error('Error fetching service:', error);
      setToast({ message: 'Service not found', type: 'error' });
      setTimeout(() => navigate('/'), 2000);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id, fetchService]);

  const handleBookAppointment = () => {
    navigate(`/booking/${id}`);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>

        {/* Service Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-100 rounded-full dark:bg-primary-900 dark:text-primary-300">
                  {service.category}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {service.name}
              </h1>
              
              <div className="flex items-center text-gray-600 dark:text-gray-300 mb-6">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{service.providerId?.businessName || service.providerId?.name}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                About this service
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {service.description || 'No description available.'}
              </p>
            </div>

            {/* Availability */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Availability
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Available Days
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {service.availableDays && service.availableDays.length > 0 ? (
                      service.availableDays.map((day, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                        >
                          {day}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No available days specified</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Time Slots
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {service.availableTimeSlots && service.availableTimeSlots.length > 0 ? (
                      service.availableTimeSlots.map((slot, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm text-center"
                        >
                          {slot}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm col-span-2">No time slots specified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Book Appointment Button */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <button
                onClick={handleBookAppointment}
                className="w-full btn btn-primary text-lg py-3"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Important Information
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Double-booking prevention ensures your appointment time is reserved exclusively for you</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>You will receive a confirmation once the provider accepts your appointment</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel pending appointments anytime from your dashboard</span>
            </li>
          </ul>
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

export default ServiceDetails;
