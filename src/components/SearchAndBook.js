import React, { useState } from 'react';
import {
  Search,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  MapPin,
  Truck,
  Zap,
  RotateCcw,
  Star,
  Route
} from 'lucide-react';
import { API_BASE_URL } from '../config/constants';

function SearchAndBook() {
  const [searchData, setSearchData] = useState({
    capacityRequired: '',
    fromPincode: '',
    toPincode: '',
    startTime: ''
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [bookingDialog, setBookingDialog] = useState({ open: false, vehicle: null, booking: null });

  const handleSearchChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const isValidPincode = (pincode) => /^[1-9][0-9]{5}$/.test(pincode);

  const isValidCapacity = (capacity) => {
    const number = parseFloat(capacity);
    return !isNaN(number) && number > 0;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    if (!isValidCapacity(searchData.capacityRequired)) {
      setMessage({ type: 'error', text: 'Please enter a valid positive capacity.' });
      setLoading(false);
      return;
    }

    if (!isValidPincode(searchData.fromPincode)) {
      setMessage({ type: 'error', text: 'From Pincode must be a 6-digit number.' });
      setLoading(false);
      return;
    }

    if (!isValidPincode(searchData.toPincode)) {
      setMessage({ type: 'error', text: 'To Pincode must be a 6-digit number.' });
      setLoading(false);
      return;
    }

    if (!searchData.startTime) {
      setMessage({ type: 'error', text: 'Please select a valid start date.' });
      setLoading(false);
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        capacityRequired: searchData.capacityRequired,
        fromPincode: searchData.fromPincode,
        toPincode: searchData.toPincode,
        startTime: new Date(searchData.startTime).toISOString()
      });

      const response = await fetch(`${API_BASE_URL}/vehicles/available?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setVehicles(data);
        if (data.length === 0) {
          setMessage({ type: 'info', text: 'No vehicles available for the specified criteria.' });
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to search vehicles' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (vehicle) => {
    setBookingLoading(vehicle._id);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle._id,
          fromPincode: searchData.fromPincode,
          toPincode: searchData.toPincode,
          startTime: new Date(searchData.startTime).toISOString(),
          customerId: 'customer-' + Date.now()
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setBookingDialog({ open: true, vehicle, booking: data });
        setVehicles(prev => prev.filter(v => v._id !== vehicle._id));
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to book vehicle' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setBookingLoading(null);
    }
  };

  const resetForm = () => {
    setSearchData({ capacityRequired: '', fromPincode: '', toPincode: '', startTime: '' });
    setVehicles([]);
    setMessage({ type: '', text: '' });
  };

  const formatDateTime = (dateString) => new Date(dateString).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Search size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Search & Book Vehicles</h1>
              <p className="text-orange-100 text-lg">Find the perfect vehicle for your logistics needs</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{vehicles.length}</div>
              <div className="text-orange-200 text-sm">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Form */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-orange-50 px-8 py-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Route size={24} className="text-orange-600" />
            <span>Search Criteria</span>
          </h2>
        </div>

        <div className="p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Capacity Required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Package className="inline mr-2" size={16} />
                  Capacity Required (KG) *
                </label>
                <input
                  type="number"
                  name="capacityRequired"
                  value={searchData.capacityRequired}
                  onChange={handleSearchChange}
                  required
                  min="1"
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-200 text-lg"
                  placeholder="Enter required capacity"
                />
              </div>

              {/* From Pincode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="inline mr-2" size={16} />
                  From Pincode *
                </label>
                <input
                  type="text"
                  name="fromPincode"
                  value={searchData.fromPincode}
                  onChange={handleSearchChange}
                  required
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-200 text-lg"
                  placeholder="e.g., 110001"
                />
              </div>

              {/* To Pincode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="inline mr-2" size={16} />
                  To Pincode *
                </label>
                <input
                  type="text"
                  name="toPincode"
                  value={searchData.toPincode}
                  onChange={handleSearchChange}
                  required
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-200 text-lg"
                  placeholder="e.g., 110005"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Calendar className="inline mr-2" size={16} />
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startTime"
                  value={searchData.startTime}
                  onChange={handleSearchChange}
                  required
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all duration-200 text-lg"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <RotateCcw size={20} />
                <span>Reset</span>
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    <span>Search Vehicles</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Enhanced Messages */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 shadow-lg ${
          message.type === 'success'
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800'
            : message.type === 'error'
            ? 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800'
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="flex-shrink-0" size={24} />
          ) : message.type === 'error' ? (
            <AlertCircle className="flex-shrink-0" size={24} />
          ) : (
            <Search className="flex-shrink-0" size={24} />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Enhanced Available Vehicles */}
      {vehicles.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Star size={24} className="text-green-600" />
              <span>Available Vehicles ({vehicles.length})</span>
            </h3>
          </div>
          
          <div className="p-8 space-y-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Truck size={28} className="text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-xl text-gray-800 mb-3">{vehicle.name}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                            <Package size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{vehicle.capacityKg} KG</div>
                            <div className="text-gray-500 text-sm">Capacity</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                            <Zap size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{vehicle.tyres} Tyres</div>
                            <div className="text-gray-500 text-sm">Configuration</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                            <Clock size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{vehicle.estimatedRideDurationHours}h</div>
                            <div className="text-gray-500 text-sm">Duration</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleBook(vehicle)}
                    disabled={bookingLoading === vehicle._id}
                    className="ml-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {bookingLoading === vehicle._id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Booking...</span>
                      </>
                    ) : (
                      <>
                        <Calendar size={16} />
                        <span>Book Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Booking Confirmation Dialog */}
      {bookingDialog.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Booking Confirmed!</h3>
                  <p className="text-green-100">Your vehicle has been reserved</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {bookingDialog.booking && (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-semibold text-gray-900">{bookingDialog.vehicle.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">From:</span>
                    <span className="font-semibold text-gray-900">{bookingDialog.booking.fromPincode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="font-semibold text-gray-900">{bookingDialog.booking.toPincode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Time:</span>
                    <span className="font-semibold text-gray-900">{formatDateTime(bookingDialog.booking.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-900">{bookingDialog.booking.estimatedRideDurationHours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer ID:</span>
                    <span className="font-semibold text-gray-900">{bookingDialog.booking.customerId}</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setBookingDialog({ open: false, vehicle: null, booking: null })}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchAndBook;
