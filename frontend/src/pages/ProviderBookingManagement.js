import React, { useState, useEffect } from 'react';
import { appointmentsService } from '../services/appointmentsService';
import './ProviderBookingManagement.css';

const ProviderBookingManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Appointments' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, selectedStatus]);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentsService.getProviderAppointments();
      setAppointments(response.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    if (selectedStatus === 'all') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter(apt => apt.status === selectedStatus));
    }
  };

  const handleAcceptAppointment = async (appointmentId) => {
    try {
      await appointmentsService.acceptAppointment(appointmentId);
      setSuccess('Appointment accepted successfully');
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept appointment');
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to reject this appointment?')) return;
    
    try {
      await appointmentsService.rejectAppointment(appointmentId);
      setSuccess('Appointment rejected successfully');
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject appointment');
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to mark this appointment as completed?')) return;
    
    try {
      await appointmentsService.completeAppointment(appointmentId);
      setSuccess('Appointment marked as completed');
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await appointmentsService.cancelAppointment(appointmentId);
      setSuccess('Appointment cancelled successfully');
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const showAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const formatStatusLabel = (status) => {
    if (status === 'accepted') return 'Confirmed';
    if (status === 'rejected') return 'Rejected';
    if (status === 'pending') return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'accepted':
        return '✅';
      case 'rejected':
        return '❌';
      case 'completed':
        return '🎉';
      case 'cancelled':
        return '🚫';
      default:
        return '📅';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActionButtons = (appointment) => {
    const buttons = [];
    
    if (appointment.status === 'pending') {
      buttons.push(
        <button
          key="accept"
          className="btn btn-success btn-sm"
          onClick={() => handleAcceptAppointment(appointment._id)}
        >
          Accept
        </button>,
        <button
          key="reject"
          className="btn btn-danger btn-sm"
          onClick={() => handleRejectAppointment(appointment._id)}
        >
          Reject
        </button>
      );
    }
    
    if (appointment.status === 'accepted') {
      buttons.push(
        <button
          key="complete"
          className="btn btn-primary btn-sm"
          onClick={() => handleCompleteAppointment(appointment._id)}
        >
          Complete
        </button>,
        <button
          key="cancel"
          className="btn btn-secondary btn-sm"
          onClick={() => handleCancelAppointment(appointment._id)}
        >
          Cancel
        </button>
      );
    }
    
    if (appointment.status === 'cancelled' || appointment.status === 'rejected') {
      buttons.push(
        <button
          key="delete"
          className="btn btn-danger btn-sm"
          onClick={() => handleCancelAppointment(appointment._id)}
        >
          Remove
        </button>
      );
    }
    
    return buttons;
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="provider-booking-management">
      <div className="dashboard-header">
        <h1>Booking Management</h1>
        <p>Manage your service appointments and bookings</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filters-section">
        <div className="status-filter">
          <label>Filter by Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="status-select"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-number">{appointments.filter(a => a.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{appointments.filter(a => a.status === 'accepted').length}</span>
            <span className="stat-label">Accepted</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{appointments.filter(a => a.status === 'completed').length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      <div className="appointments-container">
        {filteredAppointments.length === 0 ? (
          <div className="no-appointments">
            <h3>No appointments found</h3>
            <p>
              {selectedStatus === 'all' 
                ? "You don't have any appointments yet." 
                : `No appointments with status "${selectedStatus}".`}
            </p>
          </div>
        ) : (
          <div className="appointments-grid">
            {filteredAppointments.map(appointment => (
              <div key={appointment._id} className="appointment-card">
                <div className="appointment-header">
                  <div className="appointment-info">
                    <h3>{appointment.serviceName}</h3>
                    <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)} {formatStatusLabel(appointment.status)}
                    </span>
                  </div>
                  <div className="appointment-date">
                    <div className="date">{formatDate(appointment.date)}</div>
                    <div className="time">{appointment.timeSlot}</div>
                  </div>
                </div>

                <div className="appointment-details">
                  <div className="customer-info">
                    <h4>Customer Information</h4>
                    <p><strong>Name:</strong> {appointment.customerName}</p>
                    <p><strong>Email:</strong> {appointment.customerEmail}</p>
                    <p><strong>Phone:</strong> {appointment.customerId?.phone || 'Not provided'}</p>
                  </div>

                  {appointment.notes && (
                    <div className="appointment-notes">
                      <h4>Customer Notes</h4>
                      <p>{appointment.notes}</p>
                    </div>
                  )}

                  <div className="service-info">
                    <h4>Service Details</h4>
                    <p><strong>Price:</strong> ${appointment.price}</p>
                  </div>
                </div>

                <div className="appointment-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => showAppointmentDetails(appointment)}
                  >
                    View Details
                  </button>
                  <div className="action-buttons">
                    {getActionButtons(appointment)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetailsModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Appointment Details</h2>
              <button className="close-btn" onClick={closeDetailsModal}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="detail-section">
                <h3>Service Information</h3>
                <p><strong>Service:</strong> {selectedAppointment.serviceName}</p>
                <p><strong>Price:</strong> ${selectedAppointment.price}</p>
                <p><strong>Date:</strong> {formatDate(selectedAppointment.date)}</p>
                <p><strong>Time:</strong> {selectedAppointment.timeSlot}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${getStatusColor(selectedAppointment.status)}`}>
                    {getStatusIcon(selectedAppointment.status)} {formatStatusLabel(selectedAppointment.status)}
                  </span>
                </p>
              </div>

              <div className="detail-section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {selectedAppointment.customerName}</p>
                <p><strong>Email:</strong> {selectedAppointment.customerEmail}</p>
                <p><strong>Phone:</strong> {selectedAppointment.customerId?.phone || 'Not provided'}</p>
              </div>

              {selectedAppointment.notes && (
                <div className="detail-section">
                  <h3>Customer Notes</h3>
                  <p>{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="detail-section">
                <h3>Booking Information</h3>
                <p><strong>Booked on:</strong> {new Date(selectedAppointment.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> {new Date(selectedAppointment.updatedAt).toLocaleDateString()}</p>
              </div>

              <div className="modal-actions">
                <div className="action-buttons">
                  {getActionButtons(selectedAppointment)}
                </div>
                <button className="btn btn-secondary" onClick={closeDetailsModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderBookingManagement;
