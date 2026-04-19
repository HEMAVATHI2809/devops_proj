import React, { useState, useEffect } from 'react';
import { servicesService } from '../services/servicesService';
import './ProviderDashboard.css';

const initialFormState = {
  name: '',
  category: 'Healthcare & Wellness',
  description: '',
  durationMinutes: '60',
  price: '',
  appointmentFee: '0',
  image: '',
  availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  availableTimeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
};

const ProviderDashboard = () => {
  const [services, setServices] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState(initialFormState);

  const categories = [
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

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00'
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesService.getProviderServices();
      setServices(response.services || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const priceNum = Number(formData.price);
      const feeNum = Number(formData.appointmentFee === '' ? 0 : formData.appointmentFee);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        setError('Please enter a valid price.');
        return;
      }
      if (!Number.isFinite(feeNum) || feeNum < 0) {
        setError('Please enter a valid appointment fee.');
        return;
      }
      if (!formData.availableDays?.length) {
        setError('Select at least one available day.');
        return;
      }
      if (!formData.availableTimeSlots?.length) {
        setError('Select at least one time slot.');
        return;
      }
      const durationNum = Number(formData.durationMinutes);
      if (!Number.isFinite(durationNum) || durationNum < 1 || durationNum > 1440) {
        setError('Duration must be between 1 and 1440 minutes.');
        return;
      }

      const payload = {
        ...formData,
        price: priceNum,
        appointmentFee: feeNum,
        durationMinutes: durationNum
      };

      if (editingService) {
        await servicesService.updateService(editingService._id, payload);
        setSuccess('Service updated successfully');
      } else {
        await servicesService.createService(payload);
        setSuccess('Service created successfully');
      }

      resetForm(false);
      fetchServices();
    } catch (err) {
      const data = err.response?.data;
      const msgFromErrors =
        Array.isArray(data?.errors) && data.errors.length
          ? data.errors.map((x) => x.msg || x.message).filter(Boolean).join(' ')
          : '';
      setError(msgFromErrors || data?.message || 'Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      durationMinutes: service.durationMinutes != null ? String(service.durationMinutes) : '60',
      price: service.price,
      appointmentFee: service.appointmentFee ?? 0,
      image: service.image || '',
      availableDays: service.availableDays,
      availableTimeSlots: service.availableTimeSlots
    });
    setShowAddForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await servicesService.deleteService(serviceId);
      setSuccess('Service deleted successfully');
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete service');
    }
  };

  const toggleServiceStatus = async (serviceId) => {
    try {
      await servicesService.toggleServiceStatus(serviceId);
      setSuccess('Service status updated');
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update service status');
    }
  };

  const resetForm = (clearAlerts = true) => {
    setFormData({ ...initialFormState });
    setEditingService(null);
    setShowAddForm(false);
    if (clearAlerts) {
      setError('');
      setSuccess('');
    }
  };

  const openCreateForm = () => {
    setEditingService(null);
    setFormData({ ...initialFormState });
    setError('');
    setSuccess('');
    setShowAddForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleTimeSlotToggle = (slot) => {
    setFormData(prev => ({
      ...prev,
      availableTimeSlots: prev.availableTimeSlots.includes(slot)
        ? prev.availableTimeSlots.filter(s => s !== slot)
        : [...prev.availableTimeSlots, slot]
    }));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="provider-dashboard">
      <div className="dashboard-header">
        <h1>Provider Dashboard</h1>
        <button
          className="btn btn-primary"
          type="button"
          onClick={openCreateForm}
        >
          Add New Service
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="service-form">
              <div className="form-group">
                <label>Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleInputChange}
                  min="1"
                  max="1440"
                  step="1"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Appointment Fee (₹)</label>
                  <input
                    type="number"
                    name="appointmentFee"
                    value={formData.appointmentFee}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL (optional)</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Available Days</label>
                <div className="checkbox-group">
                  {daysOfWeek.map(day => (
                    <label key={day} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.availableDays.includes(day)}
                        onChange={() => handleDayToggle(day)}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Available Time Slots</label>
                <div className="checkbox-group">
                  {timeSlots.map(slot => (
                    <label key={slot} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.availableTimeSlots.includes(slot)}
                        onChange={() => handleTimeSlotToggle(slot)}
                      />
                      {slot}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="services-list">
        <h2>My Services</h2>
        {services.length === 0 ? (
          <p className="no-services">You haven't added any services yet.</p>
        ) : (
          <div className="services-grid">
            {services.map(service => (
              <div key={service._id} className={`service-card ${!service.isActive ? 'inactive' : ''}`}>
                <div className="service-header">
                  <h3>{service.name}</h3>
                  <span className={`status-badge ${service.isActive ? 'active' : 'inactive'}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="service-category">{service.category}</p>
                <p className="service-description">{service.description}</p>
                <div className="service-details">
                  <span className="price">Price: ₹{service.price}</span>
                  {service.durationMinutes != null && (
                    <span className="price" style={{ marginLeft: '10px' }}>
                      Duration: {service.durationMinutes} min
                    </span>
                  )}
                  <span className="price" style={{marginLeft: '10px'}}>Fee: ₹{service.appointmentFee || 0}</span>
                </div>
                <div className="service-availability">
                  <p><strong>Days:</strong> {(service.availableDays || []).join(', ') || '—'}</p>
                  <p><strong>Time Slots:</strong> {(service.availableTimeSlots || []).join(', ') || '—'}</p>
                </div>
                <div className="service-actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleEdit(service)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => toggleServiceStatus(service._id)}
                  >
                    {service.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(service._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
