import axios from 'axios';
import { API_BASE_URL } from './api';

export const paymentService = {
  createOrder: async (amount) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/create-order`, {
        amount: amount * 100, // Convert to paise
        currency: 'INR',
      });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  verifyPayment: async (paymentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/verify`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },
};

export default paymentService;
