import api from './api';

export const servicesService = {
  // Get all services
  getAllServices: async () => {
    const response = await api.get('/services');
    return response.data;
  },

  // Get service by ID
  getServiceById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  // Get services by category
  getServicesByCategory: async (category) => {
    const response = await api.get(`/services/category/${category}`);
    return response.data;
  },

  // Get available time slots for a provider on a specific date
  getAvailableSlots: async (providerId, date) => {
    const response = await api.get('/appointments/time-slots/available', {
      params: { providerId, date }
    });
    return response.data;
  },

  // Create new service (provider only)
  createService: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  // Update service (provider only)
  updateService: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
  },

  // Delete service (provider only)
  deleteService: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  // Toggle service status (provider only)
  toggleServiceStatus: async (id) => {
    const response = await api.patch(`/services/${id}/toggle-status`);
    return response.data;
  },

  // Get provider's services (provider only)
  getProviderServices: async () => {
    const response = await api.get('/services/provider/my-services');
    return response.data;
  }
};

export default servicesService;
