const express = require('express');
const router = express.Router();
const { auth, providerAuth, adminAuth } = require('../middleware/auth');
const { validateService } = require('../middleware/validation');

const {
  createService,
  getAllServices,
  getServicesByCategory,
  getProviderServices,
  getServiceById,
  updateService,
  deleteService,
  toggleServiceStatus
} = require('../controllers/serviceController');

// Provider-only routes
router.post('/', auth, providerAuth, validateService, createService);
router.get('/provider/my-services', auth, providerAuth, getProviderServices);
router.put('/:id', auth, providerAuth, validateService, updateService);
router.delete('/:id', auth, providerAuth, deleteService);
router.patch('/:id/toggle-status', auth, providerAuth, toggleServiceStatus);

// Admin-only route (for admin to view all services including inactive)
router.get('/admin/all', auth, adminAuth, getAllServices);

// Public routes
router.get('/', getAllServices);
router.get('/category/:category', getServicesByCategory);
router.get('/:id', getServiceById);

module.exports = router;
