function calculateRideDuration(fromPincode, toPincode) {
  const from = parseInt(fromPincode);
  const to = parseInt(toPincode);
  
  if (isNaN(from) || isNaN(to)) {
    throw new Error('Invalid pincode format');
  }
  
  return Math.abs(to - from) % 24;
}

module.exports = {
  calculateRideDuration
};