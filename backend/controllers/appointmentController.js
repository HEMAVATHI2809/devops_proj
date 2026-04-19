const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');

/** Parse YYYY-MM-DD to UTC midnight for consistent DB queries and uniqueness. */
const parseBookingDateUtc = (dateInput) => {
  const s = String(dateInput).trim().slice(0, 10);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return new Date(dateInput);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return new Date(Date.UTC(y, mo - 1, d, 0, 0, 0, 0));
};

const utcDayRange = (dateInput) => {
  const start = parseBookingDateUtc(dateInput);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
};

const createAppointment = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { serviceId, date, timeSlot, notes } = req.body;
    const customerId = req.user._id;

    // Validate required fields
    if (!serviceId || !date || !timeSlot) {
      console.error('Missing required fields:', { serviceId, date, timeSlot });
      return res.status(400).json({ 
        success: false,
        message: 'Service ID, date, and time slot are required' 
      });
    }

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      console.error('Service not found:', serviceId);
      return res.status(404).json({ 
        success: false,
        message: 'Service not found' 
      });
    }
    const appointmentDate = parseBookingDateUtc(date);
    const today = new Date();
    const utcDay = (dt) =>
      Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
    if (utcDay(appointmentDate) < utcDay(today)) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date cannot be in the past'
      });
    }

    const { start: dayStart, end: dayEnd } = utcDayRange(date);

    // Check if the time slot is available for the provider (same calendar day)
    const existingAppointment = await Appointment.findOne({
      providerId: service.providerId,
      date: { $gte: dayStart, $lt: dayEnd },
      timeSlot,
      status: { $nin: ['rejected', 'cancelled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        success: false,
        message: 'Time slot already booked' 
      });
    }

    // Get customer details
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ 
        success: false,
        message: 'Customer not found' 
      });
    }

    // Get provider details
    const provider = await User.findById(service.providerId);
    if (!provider) {
      return res.status(404).json({ 
        success: false,
        message: 'Provider not found' 
      });
    }

    // Create appointment with proper field names matching the schema
    const appointment = new Appointment({
      customerId,
      providerId: service.providerId,
      serviceId,
      date: appointmentDate,
      timeSlot,
      serviceName: service.name,
      servicePrice: service.price,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone || '',
      providerName: provider.name,
      providerEmail: provider.email,
      price: service.price, // Ensure price is set
      appointmentFee: service.appointmentFee || 0,
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending',
      amount: service.appointmentFee || 0
    });

    const savedAppointment = await appointment.save();
    
    // Populate the service and customer details for the response
    await savedAppointment.populate('serviceId', 'name description');
    await savedAppointment.populate('customerId', 'name email phone');
    await savedAppointment.populate('providerId', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: savedAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    
    // Handle specific MongoDB validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate appointment detected',
        error: 'This time slot is already booked'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while booking appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getCustomerAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ customerId: req.user.id })
      .populate('serviceId', 'name category price')
      .populate('providerId', 'name businessName email phone')
      .sort({ date: -1 });
    
    res.json({ appointments });
  } catch (error) {
    console.error('Get customer appointments error:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
};

const getProviderAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = { providerId: req.user.id };
    
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('serviceId', 'name category price')
      .populate('customerId', 'name email phone')
      .sort({ date: -1 });
    
    res.json({ appointments });
  } catch (error) {
    console.error('Get provider appointments error:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('serviceId', 'name category price')
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name businessName email phone');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has permission to view this appointment
    if (appointment.customerId._id.toString() !== req.user.id && 
        appointment.providerId._id.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error while fetching appointment' });
  }
};

const acceptAppointment = async (req, res) => {
  try {
    const query = {
      _id: req.params.id,
      status: 'pending'
    };

    // If user is a provider, only allow managing their own appointments
    if (req.user.role === 'provider') {
      query.providerId = req.user._id;
    }
    
    const appointment = await Appointment.findOne(query);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found, already processed, or you do not have permission' 
      });
    }
    
    appointment.status = 'accepted';
    appointment.updatedBy = req.user._id;
    await appointment.save();
    
    res.json({
      success: true,
      message: 'Appointment accepted successfully',
      appointment: {
        id: appointment._id,
        status: appointment.status,
        serviceName: appointment.serviceName,
        customerName: appointment.customerName,
        date: appointment.date,
        timeSlot: appointment.timeSlot
      }
    });
  } catch (error) {
    console.error('Accept appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while accepting appointment',
      error: error.message 
    });
  }
};

const rejectAppointment = async (req, res) => {
  try {
    const query = {
      _id: req.params.id,
      status: 'pending'
    };

    // If user is a provider, only allow managing their own appointments
    if (req.user.role === 'provider') {
      query.providerId = req.user._id;
    }
    
    const appointment = await Appointment.findOne(query);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found, already processed, or you do not have permission' 
      });
    }
    
    appointment.status = 'rejected';
    appointment.updatedBy = req.user._id;
    await appointment.save();
    
    res.json({
      success: true,
      message: 'Appointment rejected successfully',
      appointment: {
        id: appointment._id,
        status: appointment.status,
        serviceName: appointment.serviceName,
        customerName: appointment.customerName,
        date: appointment.date,
        timeSlot: appointment.timeSlot
      }
    });
  } catch (error) {
    console.error('Reject appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while rejecting appointment',
      error: error.message 
    });
  }
};

const completeAppointment = async (req, res) => {
  try {
    const query = {
      _id: req.params.id,
      status: 'accepted',
      providerId: req.user._id
    };
    
    const appointment = await Appointment.findOne(query);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found, not accepted, or you do not have permission' 
      });
    }
    
    appointment.status = 'completed';
    appointment.updatedBy = req.user._id;
    await appointment.save();
    
    res.json({
      success: true,
      message: 'Appointment marked as completed',
      appointment: {
        id: appointment._id,
        status: appointment.status,
        serviceName: appointment.serviceName,
        customerName: appointment.customerName,
        providerName: appointment.providerName,
        date: appointment.date,
        timeSlot: appointment.timeSlot
      }
    });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while completing appointment',
      error: error.message 
    });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    console.log('Cancelling appointment:', req.params.id, 'for user:', req.user.id);
    
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      $or: [
        { customerId: req.user.id },
        { providerId: req.user.id }
      ],
      status: { $in: ['pending', 'accepted'] }
    });
    
    if (!appointment) {
      console.error('Appointment not found or cannot be cancelled:', req.params.id);
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found or cannot be cancelled' 
      });
    }
    
    // Use findOneAndUpdate to bypass validation
    const updatedAppointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: 'cancelled' } },
      { new: true, runValidators: false } // Disable validators for this update
    );
    
    console.log('Appointment cancelled successfully:', updatedAppointment);
    res.json({ 
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while cancelling appointment',
      error: error.message 
    });
  }
};

const getProviderTimeSlots = async (req, res) => {
  try {
    const { providerId, date, serviceId } = req.query;
    
    if (!providerId || !date) {
      return res.status(400).json({ message: 'Provider ID and date are required' });
    }
    
    let services = await Service.find({ providerId, isActive: true });
    if (services.length === 0) {
      return res.json({ availableSlots: [] });
    }

    if (serviceId) {
      const one = await Service.findOne({ _id: serviceId, providerId, isActive: true });
      services = one ? [one] : [];
    }
    if (services.length === 0) {
      return res.json({ availableSlots: [] });
    }

    const { start: dayStart, end: dayEnd } = utcDayRange(date);
    const weekday = dayStart.toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: 'UTC'
    });

    const servicesForDay = services.filter(
      (s) => Array.isArray(s.availableDays) && s.availableDays.includes(weekday)
    );
    if (servicesForDay.length === 0) {
      return res.json({ availableSlots: [] });
    }

    const allPossibleSlots = [...new Set(servicesForDay.flatMap((s) => s.availableTimeSlots || []))];

    const bookedSlots = await Appointment.find({
      providerId,
      date: { $gte: dayStart, $lt: dayEnd },
      status: { $nin: ['rejected', 'cancelled'] }
    }).select('timeSlot');

    const bookedSlotTimes = bookedSlots.map((a) => a.timeSlot);

    const availableSlots = allPossibleSlots.filter((slot) => !bookedSlotTimes.includes(slot));

    res.json({ availableSlots });
  } catch (error) {
    console.error('Get provider time slots error:', error);
    res.status(500).json({ message: 'Server error while fetching available time slots' });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;
    let filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }
    
    const appointments = await Appointment.find(filter)
      .populate('serviceId', 'name category')
      .populate('customerId', 'name email')
      .populate('providerId', 'name businessName email')
      .sort({ date: -1 });
    
    res.json({ appointments });
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
};

const getAppointmentAnalytics = async (req, res) => {
  try {
    const [
      total,
      pending,
      accepted,
      rejected
    ] = await Promise.all([
      Appointment.countDocuments({}),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'accepted' }),
      Appointment.countDocuments({ status: 'rejected' })
    ]);

    res.json({
      total,
      pending,
      accepted,
      rejected
    });
  } catch (error) {
    console.error('Get appointment analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching appointment analytics' });
  }
};

const simulatePayment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (appointment.paymentStatus === 'success') {
      return res.status(400).json({ success: false, message: 'Payment already processed' });
    }

    appointment.paymentStatus = 'success';
    appointment.paymentId = 'TEST_' + Date.now();
    await appointment.save();

    res.json({
      success: true,
      message: 'Payment successful',
      appointment
    });
  } catch (error) {
    console.error('Simulate payment error:', error);
    res.status(500).json({ success: false, message: 'Server error while processing payment' });
  }
};

const updatePaymentAdmin = async (req, res) => {
  try {
    console.log("Updating payment for booking:", req.params.id);
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: "success",
        paymentId: "TEST_" + Date.now()
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, booking: appointment });
  } catch (error) {
    console.error("Update payment error:", error);
    res.status(500).json({ success: false, message: 'Payment Failed' });
  }
};

module.exports = {
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
};
