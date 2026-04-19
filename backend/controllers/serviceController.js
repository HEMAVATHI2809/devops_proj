const Service = require('../models/Service');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const createService = async (req, res) => {
  try {
    // Ensure the user is a provider
    if (req.user.role !== 'provider') {
      return res.status(403).json({ 
        message: 'Access denied. Only service providers can create services.',
        userRole: req.user.role
      });
    }

    // Add providerId from authenticated user
    console.log("Received Fee:", req.body.appointmentFee);
    const priceNum = Number(req.body.price);
    const dm = Number(req.body.durationMinutes);
    const serviceData = {
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      price: Number.isFinite(priceNum) ? priceNum : req.body.price,
      appointmentFee: req.body.appointmentFee !== undefined && req.body.appointmentFee !== ''
        ? Number(req.body.appointmentFee)
        : 0,
      image: req.body.image || '',
      availableDays: req.body.availableDays,
      availableTimeSlots: req.body.availableTimeSlots,
      providerId: req.user._id,
      isActive: true
    };
    if (Number.isFinite(dm) && dm > 0) {
      serviceData.durationMinutes = dm;
    }

    // Validate required fields
    if (!serviceData.name || !serviceData.category || !Number.isFinite(Number(serviceData.price))) {
      return res.status(400).json({ 
        message: 'Name, category, and price are required fields' 
      });
    }

    const service = new Service(serviceData);
    await service.save();
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: {
        id: service._id,
        name: service.name,
        category: service.category,
        price: service.price,
        appointmentFee: service.appointmentFee,
        isActive: service.isActive
      }
    });
  } catch (error) {
    console.error('Create service error:', error);
    if (error.name === 'ValidationError') {
      console.error('Service validation details:', Object.values(error.errors || {}).map((e) => ({
        field: e.path,
        message: e.message,
        value: e.value
      })));
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        error: error.message 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating service',
      error: error.message 
    });
  }
};

const getAllServices = async (req, res) => {
  try {
    const { category, providerId } = req.query;
    let filter = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (providerId) {
      filter.providerId = providerId;
    }

    const services = await Service.find(filter)
      .populate('providerId', 'name businessName email phone')
      .sort({ createdAt: -1 });
      
    res.json({ 
      success: true,
      services 
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching services',
      error: error.message
    });
  }
};

const getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const services = await Service.find({ 
      category, 
      isActive: true 
    })
    .populate('providerId', 'name businessName email phone')
    .sort({ createdAt: -1 });
    
    res.json({ 
      success: true,
      services 
    });
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching services by category',
      error: error.message
    });
  }
};

const getProviderServices = async (req, res) => {
  try {
    // Only allow providers to view their own services
    if (req.user.role !== 'provider') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Provider role required.'
      });
    }

    const services = await Service.find({ 
      providerId: req.user._id 
    }).sort({ createdAt: -1 });
    
    res.json({ 
      success: true,
      services 
    });
  } catch (error) {
    console.error('Get provider services error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching provider services',
      error: error.message
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      isActive: true
    }).populate('providerId', 'name businessName email phone address description');
    
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: 'Service not found or inactive' 
      });
    }
    
    res.json({ 
      success: true,
      service 
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching service',
      error: error.message
    });
  }
};

const updateService = async (req, res) => {
  try {
    // Ensure the user is a provider
    if (req.user.role !== 'provider') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Only service providers can update services.',
        userRole: req.user.role
      });
    }

    const {
      name,
      description,
      category,
      price,
      appointmentFee,
      image,
      availableDays,
      availableTimeSlots,
      durationMinutes
    } = req.body;
    console.log("Received Fee for update:", appointmentFee);
    
    // Validate required fields
    if (!name || !category || price === undefined) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, category, and price are required fields' 
      });
    }

    // Find the service and verify ownership
    const service = await Service.findOne({
      _id: req.params.id,
      providerId: req.user._id
    });
    
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: 'Service not found or you do not have permission to update it' 
      });
    }
    
    const updateData = {
      name,
      description,
      category,
      price: Number(price),
      appointmentFee: appointmentFee !== undefined ? Number(appointmentFee) : service.appointmentFee,
      updatedAt: Date.now()
    };
    if (image !== undefined) {
      updateData.image = image;
    }
    if (Array.isArray(availableDays)) {
      updateData.availableDays = availableDays;
    }
    if (Array.isArray(availableTimeSlots)) {
      updateData.availableTimeSlots = availableTimeSlots;
    }
    const dm = Number(durationMinutes);
    if (Number.isFinite(dm) && dm > 0) {
      updateData.durationMinutes = dm;
    }

    const mongoUpdate = { $set: updateData };
    if (durationMinutes === '' || durationMinutes === null || durationMinutes === undefined) {
      mongoUpdate.$unset = { durationMinutes: 1 };
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      mongoUpdate,
      { new: true, runValidators: true }
    ).populate('providerId', 'name businessName email phone');

    if (!updatedService) {
      return res.status(404).json({ 
        success: false,
        message: 'Service not found' 
      });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      service: {
        id: updatedService._id,
        name: updatedService.name,
        category: updatedService.category,
        price: updatedService.price,
        appointmentFee: updatedService.appointmentFee,
        isActive: updatedService.isActive
      }
    });
  } catch (error) {
    console.error('Update service error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        error: error.message 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating service',
      error: error.message 
    });
  }
};

const deleteService = async (req, res) => {
  try {
    // Ensure the user is a provider
    if (req.user.role !== 'provider') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Only service providers can delete services.',
        userRole: req.user.role
      });
    }

    // Find the service and verify ownership
    const service = await Service.findOne({
      _id: req.params.id,
      providerId: req.user._id
    });

    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: 'Service not found or you do not have permission to delete it' 
      });
    }

    // Check for existing appointments
    const existingAppointments = await Appointment.find({
      serviceId: service._id,
      status: { $nin: ['cancelled', 'completed', 'rejected'] }
    });

    if (existingAppointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete service with active or pending appointments',
        activeAppointments: existingAppointments.length
      });
    }

    // Soft delete by setting isActive to false
    const deletedService = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!deletedService) {
      return res.status(404).json({ 
        success: false,
        message: 'Service not found' 
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully',
      serviceId: deletedService._id
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting service',
      error: error.message 
    });
  }
};
const toggleServiceStatus = async (req, res) => {
  try {
    // Ensure the user is a provider
    if (req.user.role !== 'provider') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Only service providers can update service status.',
        userRole: req.user.role
      });
    }

    // Find the service and verify ownership
    const service = await Service.findOne({
      _id: req.params.id,
      providerId: req.user._id
    });
    
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: 'Service not found or you do not have permission to update it' 
      });
    }
    
    // Toggle the isActive status
    service.isActive = !service.isActive;
    service.updatedAt = Date.now();
    await service.save();
    
    res.json({
      success: true,
      message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
      service: {
        id: service._id,
        name: service.name,
        isActive: service.isActive
      }
    });
  } catch (error) {
    console.error('Toggle service status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while toggling service status',
      error: error.message 
    });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServicesByCategory,
  getProviderServices,
  getServiceById,
  updateService,
  deleteService,
  toggleServiceStatus
};
