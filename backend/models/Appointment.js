const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider ID is required']
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      // Stored as UTC midnight for the chosen calendar day; strict `date > now` breaks same-day and payment re-saves.
      validator: function (date) {
        const d = new Date(date);
        const today = new Date();
        const utcDay = (dt) =>
          Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
        return utcDay(d) >= utcDay(today);
      },
      message: 'Appointment date cannot be in the past'
    }
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    default: 0
  },
  // Denormalized fields for easy access
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  servicePrice: {
    type: Number,
    required: [true, 'Service price is required']
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true
  },
  providerName: {
    type: String,
    required: [true, 'Provider name is required'],
    trim: true
  },
  providerEmail: {
    type: String,
    required: [true, 'Provider email is required'],
    trim: true,
    lowercase: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  appointmentFee: {
    type: Number,
    required: [true, 'Appointment fee is required'],
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for double-booking prevention
appointmentSchema.index(
  { providerId: 1, date: 1, timeSlot: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: { $nin: ['rejected', 'cancelled'] } }
  }
);

// Index for customer appointments
appointmentSchema.index({ customerId: 1, date: 1 });

// Index for provider appointments
appointmentSchema.index({ providerId: 1, date: 1 });

// Index for admin dashboard
appointmentSchema.index({ status: 1, date: 1 });

// Virtual for formatted date
appointmentSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function() {
  const now = new Date();
  const appointmentDate = new Date(this.date);
  const timeSlotParts = this.timeSlot.split(':');
  appointmentDate.setHours(parseInt(timeSlotParts[0]), parseInt(timeSlotParts[1] || 0), 0, 0);
  
  return appointmentDate > now;
};

module.exports = mongoose.model('Appointment', appointmentSchema);
