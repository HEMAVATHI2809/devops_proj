import api from './api';

export const appointmentsService = {
  // Create new appointment (customer only)
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Get appointments for current customer
  getCustomerAppointments: async () => {
    const response = await api.get('/appointments/customer/my-appointments');
    return response.data;
  },

  // Get appointments for current provider
  getProviderAppointments: async () => {
    const response = await api.get('/appointments/provider/my-appointments');
    return response.data;
  },

  // Get available time slots for a provider on a specific date
  getAvailableTimeSlots: async (providerId, date) => {
    const response = await api.get('/appointments/time-slots/available', {
      params: { providerId, date }
    });
    return response.data;
  },

  // Get all appointments (admin only)
  getAllAppointments: async () => {
    const response = await api.get('/appointments/admin');
    return response.data;
  },

  // Accept appointment (provider only)
  acceptAppointment: async (appointmentId) => {
    const response = await api.patch(`/appointments/${appointmentId}/accept`);
    return response.data;
  },

  // Reject appointment (provider only)
  rejectAppointment: async (appointmentId) => {
    const response = await api.patch(`/appointments/${appointmentId}/reject`);
    return response.data;
  },

  // Complete appointment (provider only)
  completeAppointment: async (appointmentId) => {
    const response = await api.patch(`/appointments/${appointmentId}/complete`);
    return response.data;
  },

  // Cancel appointment (customer or provider)
  cancelAppointment: async (appointmentId) => {
    try {
      const response = await api.patch(`/appointments/${appointmentId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  },

  // Get appointment by ID
  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  }
};

export default appointmentsService;
