const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider ID is required']
  },
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Healthcare & Wellness', 'Beauty & Personal Care', 'Education & Training', 'Corporate & Professional Services', 'Home & Maintenance', 'Creative & Arts', 'Technology & Digital', 'Sports & Fitness', 'Other']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  appointmentFee: {
    type: Number,
    required: [true, 'Appointment fee is required'],
    default: 0,
    min: [0, 'Appointment fee cannot be negative']
  },
  image: {
    type: String,
    default: ''
  },
  availableDays: {
    type: [String],
    required: [true, 'Available days are required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    validate: {
      validator: function(days) {
        return days.length > 0;
      },
      message: 'At least one available day must be selected'
    }
  },
  availableTimeSlots: {
    type: [String],
    required: [true, 'Available time slots are required'],
    validate: {
      validator: function(slots) {
        return slots.length > 0;
      },
      message: 'At least one time slot must be provided'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
serviceSchema.index({ category: 1 });
serviceSchema.index({ providerId: 1 });
serviceSchema.index({ isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
