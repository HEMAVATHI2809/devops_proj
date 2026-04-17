import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { servicesService } from '../services/servicesService';
import { appointmentsService } from '../services/appointmentsService';
import PaymentModal from '../components/PaymentModal';
import api from '../services/api';
import './CustomerDashboard.css';

const categories = [
  'All',
  'Healthcare & Wellness',
  'Beauty & Personal Care',
  'Education & Training',
  'Corporate & Professional Services',
  'Home & Maintenance',
  'Creative & Arts',
  'Technology & Digital',
  'Sports & Fitness',
  'Other'
];

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toast, setToast] = useState(null);

  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [pendingAppointmentId, setPendingAppointmentId] = useState(null);

  const [bookingData, setBookingData] = useState({
    serviceId: '',
    date: '',
    timeSlot: '',
    notes: ''
  });

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await servicesService.getAllServices();
      setServices(response.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError(error.response?.data?.message || 'Failed to load services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterServices = useCallback(() => {
    let filtered = services;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.providerId?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, selectedCategory]);

  const fetchAppointments = useCallback(async () => {
    try {
      setAppointmentsLoading(true);
      const response = await appointmentsService.getCustomerAppointments();
      setAppointments(response.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.response?.data?.message || 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  const cancelAppointment = async (appointment) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      setAppointments(prevAppointments => 
        prevAppointments.map(a => 
          a._id === appointment._id ? { ...a, status: 'cancelling' } : a
        )
      );
      
      await appointmentsService.cancelAppointment(appointment._id);
      
      // Show refund message if the appointment was paid
      if (appointment.status === 'paid') {
        setToast({ 
          message: 'Appointment cancelled successfully. Payment refunded!', 
          type: 'success',
          autoClose: 5000
        });
      } else {
        setToast({ 
          message: 'Appointment cancelled successfully', 
          type: 'success',
          autoClose: 3000
        });
      }
      
      // Refresh the appointments list
      await fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      
      // Revert the status change in case of error
      setAppointments(prevAppointments => 
        prevAppointments.map(a => 
          a._id === appointment._id ? { ...a, status: appointment.status } : a
        )
      );
      
      setToast({ 
        message: error.message || 'Failed to cancel appointment. Please try again.', 
        type: 'error',
        autoClose: 5000
      });
    }
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setBookingData({
      serviceId: service._id,
      date: '',
      timeSlot: '',
      notes: ''
    });
    setShowBookingForm(true);
    setAvailableTimeSlots([]);
  };

  const handleDateChange = async (date) => {
    setBookingData(prev => ({ ...prev, date, timeSlot: '' }));
    
    if (date && selectedService) {
      try {
        const response = await appointmentsService.getAvailableTimeSlots(selectedService.providerId._id, date);
        setAvailableTimeSlots(response.availableSlots || []);
      } catch (err) {
        console.error('Failed to fetch available time slots:', err);
        setAvailableTimeSlots([]);
      }
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Format the date to YYYY-MM-DD and validate
      if (!bookingData.date || !bookingData.timeSlot) {
        throw new Error('Please select both date and time slot');
      }

      // Format date to YYYY-MM-DD
      const formattedDate = new Date(bookingData.date).toISOString().split('T')[0];
      
      // Create appointment
      const response = await api.post('/appointments', {
        serviceId: selectedService._id,
        date: formattedDate,
        timeSlot: bookingData.timeSlot,
        notes: bookingData.notes || ''
      });
      
      setPendingAppointmentId(response.data.appointment._id);
      setShowBookingForm(false);
      setShowPayment(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         err.message ||
                         'Failed to initiate booking. Please try again.';
      setError(errorMessage);
      console.error('Booking error:', err.response?.data || err);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      if (pendingAppointmentId) {
        await api.post(`/appointments/${pendingAppointmentId}/payment`);
      }
      setSuccess('Appointment booked and payment successful!');
      setSelectedService(null);
      setBookingData({
        serviceId: '',
        date: '',
        timeSlot: '',
        notes: ''
      });
      setShowPayment(false);
      fetchAppointments();
    } catch (err) {
      setError('Payment verification failed.');
      setShowPayment(false);
    }
  };

  const handlePaymentClose = () => {
    setShowPayment(false);
    setError('Payment cancelled. Booking is pending.');
    fetchAppointments();
  };

  const closeModal = () => {
    setShowBookingForm(false);
    setSelectedService(null);
    setError('');
    setSuccess('');
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchServices();
    fetchAppointments();
  }, [fetchServices, fetchAppointments]);

  useEffect(() => {
    filterServices();
  }, [filterServices]);


  return (
    <div className="customer-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>Browse services and manage your appointments</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search services, providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-filter">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="main-content">
        <div className="services-section">
          <h2>Available Services</h2>
          {loading ? (
            <div className="loading">Loading services...</div>
          ) : filteredServices.length === 0 ? (
            <div className="no-services">
              <h3>No services found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="services-grid">
              {filteredServices.map(service => (
                <div key={service._id} className="service-card">
                  {service.image && (
                    <div className="service-image">
                      <img src={service.image} alt={service.name} />
                    </div>
                  )}
                  
                  <div className="service-content">
                    <div className="service-header">
                      <h3>{service.name}</h3>
                      <span className="category-badge">{service.category}</span>
                    </div>
                    
                    <div className="provider-info">
                      <div>
                        <strong>{service.providerId?.businessName || service.providerId?.name}</strong>
                        {service.providerId?.address?.city && (
                          <span className="location">, {service.providerId.address.city}</span>
                        )}
                      </div>
                      {service.availableTimeSlots && service.availableTimeSlots.length > 3 && (
                        <div className="more-slots">+{service.availableTimeSlots.length - 3} more slots available</div>
                      )}
                    </div>
                    
                    <button
                      className="btn btn-primary book-btn"
                      onClick={() => handleServiceClick(service)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="appointments-section">
          <h2>My Appointments</h2>
          {appointmentsLoading ? (
            <div className="loading">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="no-appointments">
              <p>No appointments yet.</p>
            </div>
          ) : (
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="appointment-card"
                >
                  <div className="appointment-header">
                    <h3>{appointment.serviceName}</h3>
                    <div className="status-badges">
                      <span className={`status-badge ${appointment.status}`}>
                        {appointment.status}
                      </span>
                      {appointment.paymentStatus === 'success' && (
                        <span className="status-badge success" style={{marginLeft: '8px', backgroundColor: '#e6fffa', color: '#047857'}}>
                          ✓ Paid
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="appointment-details">
                    <p><strong>Provider:</strong> {appointment.providerName}</p>
                    <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {appointment.timeSlot}</p>
                  </div>

                  {appointment.status === 'pending' && (
                    <button
                      onClick={() => cancelAppointment(appointment)}
                      className="btn btn-secondary cancel-btn"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showBookingForm && selectedService && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Book Appointment</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="service-summary">
              <h3>{selectedService.name}</h3>
              <p>{selectedService.providerId?.businessName || selectedService.providerId?.name}</p>
              <p className="price-duration">Appointment Fee: ₹{selectedService.appointmentFee || 0}</p>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="booking-form">
              <div className="form-group">
                <label>Select Date *</label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={getMinDate()}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Select Time Slot *</label>
                <select
                  value={bookingData.timeSlot}
                  onChange={(e) => setBookingData(prev => ({ ...prev, timeSlot: e.target.value }))}
                  required
                  disabled={!bookingData.date}
                >
                  <option value="">Choose a time slot</option>
                  {availableTimeSlots.length === 0 && bookingData.date ? (
                    <option disabled>No available slots</option>
                  ) : (
                    availableTimeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))
                  )}
                </select>
              </div>
              
              <div className="form-group">
                <label>Additional Notes (optional)</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                  placeholder="Any special requests or information..."
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Proceed to Pay
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="toast-close">×</button>
        </div>
      )}

      {showPayment && selectedService && (
        <PaymentModal
          isOpen={showPayment}
          onClose={handlePaymentClose}
          amount={selectedService.appointmentFee || 0}
          serviceName={selectedService.name}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
