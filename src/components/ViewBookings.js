import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  User,
  Truck,
  RefreshCw,
  Trash2,
  Activity,
  BookOpen,
  Route,
  Timer
} from 'lucide-react';
import { API_BASE_URL } from '../config/constants';

function ViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [cancellingId, setCancellingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = bookings.slice(startIndex, endIndex);


  const fetchBookings = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`);
      const data = await response.json();

      if (response.ok) {
        setBookings(data);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch bookings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Booking cancelled successfully!' });
        fetchBookings();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to cancel booking' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: 'text-green-600'
        };
      case 'completed':
        return {
          bg: 'bg-gradient-to-r from-blue-100 to-indigo-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: 'text-blue-600'
        };
      case 'cancelled':
        return {
          bg: 'bg-gradient-to-r from-red-100 to-pink-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: 'text-red-600'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-100 to-gray-200',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: 'text-gray-600'
        };
    }
  };

  const getBookingStats = () => {
    const active = bookings.filter(b => b.status === 'active').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    return { active, completed, cancelled, total: bookings.length };
  };

  const stats = getBookingStats();
  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <BookOpen size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Booking Management</h1>
              <p className="text-purple-100 text-lg">Track and manage all vehicle reservations</p>
            </div>
          </div>
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
          >
            <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={20} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Messages */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 shadow-lg ${message.type === 'success'
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800'
            : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800'
          }`}>
          {message.type === 'success' ?
            <CheckCircle className="flex-shrink-0" size={24} /> :
            <AlertCircle className="flex-shrink-0" size={24} />
          }
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Bookings List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-purple-50 px-8 py-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Route size={24} className="text-purple-600" />
            <span>All Bookings</span>
          </h2>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xl text-gray-600">Loading bookings...</span>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
              <p className="text-gray-500 mb-6">No vehicle bookings have been made yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentBookings.map((booking) => {
                const statusStyle = getStatusColor(booking.status);
                return (
                  <div
                    key={booking._id}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <Truck size={28} className="text-white" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="font-bold text-xl text-gray-800">
                              {booking.vehicleId?.name || 'Unknown Vehicle'}
                            </h4>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border shadow-sm`}>
                              {booking.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Route Information */}
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                                <MapPin size={20} className="text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {booking.fromPincode} → {booking.toPincode}
                                </div>
                                <div className="text-gray-500 text-sm">Route</div>
                              </div>
                            </div>

                            {/* Start Date */}
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                                <Calendar size={20} className="text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {formatDateTime(booking.startTime)}
                                </div>
                                <div className="text-gray-500 text-sm">Start Time</div>
                              </div>
                            </div>

                            {/* Duration */}
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                                <Timer size={20} className="text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {booking.estimatedRideDurationHours}h
                                </div>
                                <div className="text-gray-500 text-sm">Duration</div>
                              </div>
                            </div>

                            {/* End Date */}
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                                <Clock size={20} className="text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {formatDateTime(booking.endTime)}
                                </div>
                                <div className="text-gray-500 text-sm">End Time</div>
                              </div>
                            </div>

                            {/* Customer */}
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                                <User size={20} className="text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {booking.customerId}
                                </div>
                                <div className="text-gray-500 text-sm">Customer</div>
                              </div>
                            </div>

                            {/* Booking Date */}
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                <BookOpen size={20} className="text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {new Date(booking.createdAt).toLocaleDateString()}
                                </div>
                                <div className="text-gray-500 text-sm">Booked On</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      {booking.status === 'active' && (
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          disabled={cancellingId === booking._id}
                          className="ml-6 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          {cancellingId === booking._id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Cancelling...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} />
                              <span>Cancel</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>


      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-purple-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          Next
        </button>
      </div>

    </div>
  );
}

export default ViewBookings;