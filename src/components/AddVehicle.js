import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, AlertCircle, Plus, Save, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config/constants';
import { useNavigate, useParams } from 'react-router-dom';

function AddVehicle() {
  const [formData, setFormData] = useState({
    name: '',
    capacityKg: '',
    tyres: '',
    noOfSeats: '',
    vehicleNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Fetch vehicle data if editing
  useEffect(() => {
    if (isEditing) {
      async function fetchVehicle() {
        try {
          const response = await fetch(`${API_BASE_URL}/vehicles/${id}`);
          const data = await response.json();
          setFormData({
            name: data.name || '',
            capacityKg: data.capacityKg || '',
            tyres: data.tyres || '',
            noOfSeats: data.noOfSeats || '',
            vehicleNumber: data.vehicleNumber || ''
          });
        } catch (error) {
          setMessage({ type: 'error', text: 'Failed to load vehicle data' });
        }
      }
      fetchVehicle();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = isEditing ? `${API_BASE_URL}/vehicles/${id}` : `${API_BASE_URL}/vehicles`;
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          capacityKg: parseInt(formData.capacityKg),
          tyres: parseInt(formData.tyres),
          noOfSeats: formData.noOfSeats ? parseInt(formData.noOfSeats) : undefined,
          vehicleNumber: formData.vehicleNumber || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: isEditing ? 'Vehicle updated successfully!' : 'Vehicle added successfully!' 
        });
        if (!isEditing) {
          setFormData({ name: '', capacityKg: '', tyres: '', noOfSeats: '', vehicleNumber: '' });
        }
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/vehicles');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || `Failed to ${isEditing ? 'update' : 'add'} vehicle` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/vehicles')}
              className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              {isEditing ? <Save size={32} /> : <Plus size={32} />}
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h1>
              <p className="text-green-100 text-lg">
                {isEditing ? 'Update vehicle information' : 'Add a vehicle to your fleet'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Truck size={24} className="text-blue-600" />
            <span>Vehicle Details</span>
          </h2>
        </div>

        <div className="p-8">
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
              message.type === 'success' 
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Vehicle Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-lg"
                    placeholder="Enter vehicle name (e.g., Cargo Truck A1)"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <Truck size={20} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Capacity (KG) *
                </label>
                <input
                  type="number"
                  name="capacityKg"
                  value={formData.capacityKg}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-lg"
                  placeholder="e.g., 5000"
                />
              </div>

              {/* Tyres */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Number of Tyres *
                </label>
                <input
                  type="number"
                  name="tyres"
                  value={formData.tyres}
                  onChange={handleChange}
                  required
                  min="2"
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-lg"
                  placeholder="e.g., 6"
                />
              </div>

              {/* Number of Seats */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Number of Seats
                  <span className="text-gray-500 font-normal"> (Optional)</span>
                </label>
                <input
                  type="number"
                  name="noOfSeats"
                  value={formData.noOfSeats}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-lg"
                  placeholder="e.g., 5"
                />
              </div>

              {/* Vehicle Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Vehicle Number
                  <span className="text-gray-500 font-normal"> (Optional)</span>
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-lg"
                  placeholder="e.g., KA01MD1235"
                />
              </div>
            </div>

            {/* Required Fields Note */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-700 text-sm">
                <span className="font-semibold">Note:</span> Fields marked with * are required
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/vehicles')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <ArrowLeft size={20} />
                <span>Back to Vehicles</span>
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isEditing ? 'Updating...' : 'Adding...'}</span>
                  </>
                ) : (
                  <>
                    {isEditing ? <Save size={20} /> : <Plus size={20} />}
                    <span>{isEditing ? 'Update Vehicle' : 'Add Vehicle'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddVehicle;
