const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

describe('Booking API', () => {
  let testVehicle;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/fleetlink-test');
  });

  beforeEach(async () => {
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    
    testVehicle = await Vehicle.create({
      name: 'Test Truck',
      capacityKg: 1000,
      tyres: 6
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/bookings', () => {
    const bookingData = {
      fromPincode: '110001',
      toPincode: '110005',
      startTime: '2024-12-01T10:00:00.000Z',
      customerId: 'test-customer'
    };

    it('should create a booking with valid data', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          ...bookingData,
          vehicleId: testVehicle._id
        })
        .expect(201);

      expect(response.body.vehicleId._id).toBe(testVehicle._id.toString());
      expect(response.body.fromPincode).toBe(bookingData.fromPincode);
      expect(response.body.estimatedRideDurationHours).toBe(4);
    });

    it('should reject booking with non-existent vehicle', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post('/api/bookings')
        .send({
          ...bookingData,
          vehicleId: fakeId
        })
        .expect(404);

      expect(response.body.error).toBe('Vehicle not found');
    });

    it('should reject booking with conflicting time slot', async () => {
      // Create initial booking
      await request(app)
        .post('/api/bookings')
        .send({
          ...bookingData,
          vehicleId: testVehicle._id
        })
        .expect(201);

      // Try to create overlapping booking
      const response = await request(app)
        .post('/api/bookings')
        .send({
          ...bookingData,
          vehicleId: testVehicle._id,
          startTime: '2024-12-01T12:00:00.000Z' // Overlaps with first booking
        })
        .expect(409);

      expect(response.body.error).toContain('overlapping time slot');
    });

    it('should reject booking with missing required fields', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          vehicleId: testVehicle._id,
          fromPincode: '110001'
          // Missing other required fields
        })
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should reject booking with invalid date format', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({
          ...bookingData,
          vehicleId: testVehicle._id,
          startTime: 'invalid-date'
        })
        .expect(400);

      expect(response.body.error).toContain('valid ISO date');
    });
  });
});
