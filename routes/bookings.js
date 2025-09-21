const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { calculateRideDuration } = require('../utils/calculations');

// POST /api/bookings - Create a new booking
router.post('/', async (req, res) => {
  try {
    const { vehicleId, fromPincode, toPincode, startTime, customerId } = req.body;

    // Validation
    if (!vehicleId || !fromPincode || !toPincode || !startTime || !customerId) {
      return res.status(400).json({
        error: 'All fields (vehicleId, fromPincode, toPincode, startTime, customerId) are required'
      });
    }

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return res.status(400).json({
        error: 'startTime must be a valid ISO date string'
      });
    }

    // Calculate ride duration and end time
    const estimatedRideDurationHours = calculateRideDuration(fromPincode, toPincode);
    const bookingEndTime = new Date(start.getTime() + (estimatedRideDurationHours * 60 * 60 * 1000));

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      vehicleId,
      status: 'active',
      $or: [
        { startTime: { $gte: start, $lt: bookingEndTime } },
        { endTime: { $gt: start, $lte: bookingEndTime } },
        { startTime: { $lte: start }, endTime: { $gte: bookingEndTime } }
      ]
    });

    if (conflictingBooking) {
      return res.status(409).json({
        error: 'Vehicle is already booked for an overlapping time slot'
      });
    }

    // Create booking
    const booking = new Booking({
      vehicleId,
      fromPincode: fromPincode.trim(),
      toPincode: toPincode.trim(),
      startTime: start,
      endTime: bookingEndTime,
      customerId: customerId.trim(),
      estimatedRideDurationHours
    });

    const savedBooking = await booking.save();
    const populatedBooking = await Booking.findById(savedBooking._id).populate('vehicleId');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: Object.values(error.errors)[0].message
      });
    }
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/bookings - Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicleId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// DELETE /api/bookings/:id - Cancel a booking (Bonus feature)
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;
