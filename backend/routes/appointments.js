const express = require('express');
const router = express.Router();
const { auth, customerAuth, providerAuth, adminAuth } = require('../middleware/auth');
const { validateAppointment } = require('../middleware/validation');

// Middleware to check if user is a provider or admin
const providerOrAdmin = (req, res, next) => {
  if (req.user.role === 'provider' || req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ 
    success: false,
    message: 'Access denied. Provider or Admin role required.' 
  });
};

const {
  createAppointment,
  getCustomerAppointments,
  getProviderAppointments,
  getAppointmentById,
  acceptAppointment,
  rejectAppointment,
  completeAppointment,
  cancelAppointment,
  getProviderTimeSlots,
  getAllAppointments,
  getAppointmentAnalytics,
  simulatePayment,
  updatePaymentAdmin
} = require('../controllers/appointmentController');

// Customer-only routes
router.post('/', auth, customerAuth, validateAppointment, createAppointment);
router.get('/customer/my-appointments', auth, customerAuth, getCustomerAppointments);
router.post('/:id/payment', auth, customerAuth, simulatePayment);

// Provider and Admin routes for appointment management
router.get('/provider/my-appointments', auth, providerAuth, getProviderAppointments);
router.patch('/:id/accept', auth, providerOrAdmin, acceptAppointment);
router.patch('/:id/reject', auth, providerOrAdmin, rejectAppointment);
router.patch('/:id/complete', auth, providerOrAdmin, completeAppointment);

// Shared routes (both customer and provider can cancel)
router.patch('/:id/cancel', auth, cancelAppointment);

// Public route for checking available time slots
router.get('/time-slots/available', getProviderTimeSlots);

// Admin-only routes
router.get('/admin', auth, adminAuth, getAllAppointments);
router.get('/analytics', auth, adminAuth, getAppointmentAnalytics);
router.put('/update-payment/:id', auth, adminAuth, updatePaymentAdmin);

// Get appointment by ID (customer, provider, or admin)
router.get('/:id', auth, getAppointmentById);

module.exports = router;
