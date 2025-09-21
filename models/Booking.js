const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle ID is required']
  },
  fromPincode: {
    type: String,
    required: [true, 'From pincode is required'],
    trim: true
  },
  toPincode: {
    type: String,
    required: [true, 'To pincode is required'],
    trim: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  customerId: {
    type: String,
    required: [true, 'Customer ID is required'],
    trim: true
  },
  estimatedRideDurationHours: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for efficient availability queries
bookingSchema.index({ vehicleId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
