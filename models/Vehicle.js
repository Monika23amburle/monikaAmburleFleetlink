const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true
  },
  capacityKg: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1 kg']
  },
  tyres: {
    type: Number,
    required: [true, 'Number of tyres is required'],
    min: [2, 'Vehicle must have at least 2 tyres']
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle Number is required'],
  },
  noOfSeats: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);