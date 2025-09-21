const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

describe('Vehicle API', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/fleetlink-test');
  });

  beforeEach(async () => {
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/vehicles', () => {
    it('should create a new vehicle with valid data', async () => {
      const vehicleData = {
        name: 'Test Truck',
        capacityKg: 1000,
        tyres: 6
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(vehicleData)
        .expect(201);

      expect(response.body.name).toBe(vehicleData.name);
      expect(response.body.capacityKg).toBe(vehicleData.capacityKg);
      expect(response.body.tyres).toBe(vehicleData.tyres);
    });

    it('should reject vehicle with missing required fields', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .send({ name: 'Test Truck' })
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should reject vehicle with invalid capacity', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .send({
          name: 'Test Truck',
          capacityKg: -100,
          tyres: 6
        })
        .expect(400);

      expect(response.body.error).toContain('positive number');
    });

    it('should reject vehicle with insufficient tyres', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .send({
          name: 'Test Truck',
          capacityKg: 1000,
          tyres: 1
        })
        .expect(400);

      expect(response.body.error).toContain('at least 2');
    });
  });

  describe('GET /api/vehicles/available', () => {
    let testVehicle;

    beforeEach(async () => {
      testVehicle = await Vehicle.create({
        name: 'Test Truck',
        capacityKg: 1000,
        tyres: 6
      });
    });

    it('should return available vehicles with no conflicts', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 500,
          fromPincode: '110001',
          toPincode: '110005',
          startTime: '2024-12-01T10:00:00.000Z'
        })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]._id).toBe(testVehicle._id.toString());
      expect(response.body[0].estimatedRideDurationHours).toBe(4);
    });

    it('should not return vehicles with insufficient capacity', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 1500,
          fromPincode: '110001',
          toPincode: '110005',
          startTime: '2024-12-01T10:00:00.000Z'
        })
        .expect(200);

      expect(response.body).toHaveLength(0);
    });

    it('should not return vehicles with conflicting bookings', async () => {
      // Create a conflicting booking
      await Booking.create({
        vehicleId: testVehicle._id,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: new Date('2024-12-01T09:00:00.000Z'),
        endTime: new Date('2024-12-01T12:00:00.000Z'),
        customerId: 'test-customer',
        estimatedRideDurationHours: 3
      });

      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 500,
          fromPincode: '110001',
          toPincode: '110005',
          startTime: '2024-12-01T10:00:00.000Z'
        })
        .expect(200);

      expect(response.body).toHaveLength(0);
    });

    it('should require all query parameters', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 500,
          fromPincode: '110001'
          // Missing toPincode and startTime
        })
        .expect(400);

      expect(response.body.error).toContain('required');
    });
  });
});
