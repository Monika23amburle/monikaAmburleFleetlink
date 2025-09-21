const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { calculateRideDuration } = require('../utils/calculations');

// POST /api/vehicles - Add a new vehicle
router.post('/', async (req, res) => {
  try {
    const { name, capacityKg, tyres, vehicleNumber, noOfSeats } = req.body;

    // Validation
    if (!name || !capacityKg || !tyres) {
      return res.status(400).json({
        error: 'All fields (name, capacityKg, tyres) are required'
      });
    }

    if (typeof capacityKg !== 'number' || capacityKg <= 0) {
      return res.status(400).json({
        error: 'Capacity must be a positive number'
      });
    }

    if (typeof tyres !== 'number' || tyres < 2) {
      return res.status(400).json({
        error: 'Tyres must be a number and at least 2'
      });
    }
    if (!vehicleNumber || !/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/.test(vehicleNumber)) {
      return res.status(400).json({
        error: 'Vehicle number is required and must be in valid format (e.g., KA01AB1234)'
      });
    }


    const vehicle = new Vehicle({
      name: name.trim(),
      capacityKg,
      tyres,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      noOfSeats
    });


    const savedVehicle = await vehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: Object.values(error.errors)[0].message
      });
    }
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// GET /api/vehicles/available - Find available vehicles
router.get('/available', async (req, res) => {
  try {
    const { capacityRequired, fromPincode, toPincode, startTime } = req.query;

    // Validation
    if (!capacityRequired || !fromPincode || !toPincode || !startTime) {
      return res.status(400).json({
        error: 'All query parameters (capacityRequired, fromPincode, toPincode, startTime) are required'
      });
    }

    const capacity = parseFloat(capacityRequired);
    if (isNaN(capacity) || capacity <= 0) {
      return res.status(400).json({
        error: 'capacityRequired must be a positive number'
      });
    }

    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return res.status(400).json({
        error: 'startTime must be a valid ISO date string'
      });
    }

    // Calculate ride duration and end time
    const estimatedRideDurationHours = calculateRideDuration(fromPincode, toPincode);
    const endTime = new Date(start.getTime() + (estimatedRideDurationHours * 60 * 60 * 1000));

    // Find vehicles with sufficient capacity
    const eligibleVehicles = await Vehicle.find({
      capacityKg: { $gte: capacity }
    });

    if (eligibleVehicles.length === 0) {
      return res.json([]);
    }

    const eligibleVehicleIds = eligibleVehicles.map(v => v._id);

    // Find conflicting bookings
    const conflictingBookings = await Booking.find({
      vehicleId: { $in: eligibleVehicleIds },
      status: 'active',
      $or: [
        // Booking starts during requested time window
        { startTime: { $gte: start, $lt: endTime } },
        // Booking ends during requested time window
        { endTime: { $gt: start, $lte: endTime } },
        // Booking completely encompasses requested time window
        { startTime: { $lte: start }, endTime: { $gte: endTime } }
      ]
    });

    const conflictingVehicleIds = conflictingBookings.map(b => b.vehicleId.toString());

    // Filter out conflicting vehicles
    const availableVehicles = eligibleVehicles
      .filter(vehicle => !conflictingVehicleIds.includes(vehicle._id.toString()))
      .map(vehicle => ({
        ...vehicle.toObject(),
        estimatedRideDurationHours
      }));

    res.json(availableVehicles);
  } catch (error) {
    console.error('Error finding available vehicles:', error);
    res.status(500).json({ error: 'Failed to find available vehicles' });
  }
});

// GET /api/vehicles - Get all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vehicle" });
  }
});


// DELETE /api/vehicles/:id - Delete a vehicle by ID
router.delete('/:id', async (req, res) => {
  try {
    const vehicleId = req.params.id;

    const deletedVehicle = await Vehicle.findByIdAndDelete(vehicleId);
    if (!deletedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// PUT /api/vehicles/:id - Update a vehicle by ID
router.put('/:id', async (req, res) => {
  console.log("id:", req.params.id);
  try {
    const vehicleId = req.params.id;
    const { name, capacityKg, tyres, vehicleNumber, noOfSeats } = req.body;

    if (!name || !capacityKg || !tyres) {
      return res.status(400).json({
        error: 'All fields (name, capacityKg, tyres) are required'
      });
    }

    if (typeof capacityKg !== 'number' || capacityKg <= 0) {
      return res.status(400).json({
        error: 'Capacity must be a positive number'
      });
    }

    if (typeof tyres !== 'number' || tyres < 2) {
      return res.status(400).json({
        error: 'Tyres must be a number and at least 2'
      });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      {
        name: name.trim(),
        capacityKg,
        tyres,
        vehicleNumber: vehicleNumber.trim(),
        noOfSeats: parseInt(noOfSeats, 10)
      },
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(updatedVehicle);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: Object.values(error.errors)[0].message
      });
    }
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});


module.exports = router;
