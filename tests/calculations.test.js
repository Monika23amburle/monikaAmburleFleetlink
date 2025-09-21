const { calculateRideDuration } = require('../utils/calculations');

describe('Ride Duration Calculation', () => {
  it('should calculate duration correctly for valid pincodes', () => {
    expect(calculateRideDuration('110001', '110005')).toBe(4);
    expect(calculateRideDuration('110005', '110001')).toBe(4);
    expect(calculateRideDuration('110001', '110025')).toBe(0); // 24 % 24 = 0
  });

  it('should handle large pincode differences with modulo', () => {
    expect(calculateRideDuration('110001', '110030')).toBe(5); // 29 % 24 = 5
  });

  it('should throw error for invalid pincodes', () => {
    expect(() => calculateRideDuration('invalid', '110001')).toThrow('Invalid pincode format');
    expect(() => calculateRideDuration('110001', 'invalid')).toThrow('Invalid pincode format');
  });
});