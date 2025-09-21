import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/constants';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit3, Plus, Truck, Zap, Users, Hash, ChevronLeft, ChevronRight } from 'lucide-react';

function VehiclesList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); 
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/vehicles`);
        const data = await response.json();
        setVehicles(data);
      } catch {
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, []);

  const handleDelete = async (vehicleId) => {
    if (deletingId) return;
    setDeletingId(vehicleId);
    try {
      await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, { method: 'DELETE' });
      setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
      
      // Adjust current page if needed after deletion
      const totalPagesAfterDelete = Math.ceil((vehicles.length - 1) / itemsPerPage);
      if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
        setCurrentPage(totalPagesAfterDelete);
      }
    } catch {
      // Handle error
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (vehicle) => {
    navigate(`/edit-vehicle/${vehicle._id}`);
  };

  const handleAddVehicle = () => {
    navigate('/add-vehicle');
  };

  const openConfirmDialog = (vehicle) => {
    setVehicleToDelete(vehicle);
    setConfirmOpen(true);
  };

  const closeConfirmDialog = () => {
    setVehicleToDelete(null);
    setConfirmOpen(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(vehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = vehicles.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Truck size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Vehicle Fleet</h1>
              <p className="text-blue-100 text-lg">Manage your logistics vehicles</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{vehicles.length}</div>
              <div className="text-blue-200 text-sm">Total Vehicles</div>
            </div>
            <button
              onClick={handleAddVehicle}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus size={20} />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xl text-gray-600">Loading vehicles...</span>
            </div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Vehicles Found</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first vehicle to the fleet</p>
            <button
              onClick={handleAddVehicle}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus size={20} />
              <span>Add First Vehicle</span>
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700"></th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Vehicle Details</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Capacity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Specifications</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentVehicles.map((vehicle, idx) => (
                    <tr key={vehicle._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                      <td className="px-6 py-6">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {startIndex + idx + 1}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                            <Truck size={24} className="text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-lg">{vehicle.name}</div>
                            <div className="text-gray-500 text-sm flex items-center space-x-1">
                              <Hash size={14} />
                              <span>{vehicle.vehicleNumber || 'No registration'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                            <Zap size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{vehicle.capacityKg} KG</div>
                            <div className="text-gray-500 text-xs">Load Capacity</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-600">T</span>
                            </div>
                            <span className="text-gray-700">{vehicle.tyres} Tyres</span>
                          </div>
                          {vehicle.noOfSeats && (
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                                <Users size={12} className="text-blue-600" />
                              </div>
                              <span className="text-gray-700">{vehicle.noOfSeats} Seats</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
                            title="Edit vehicle"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => openConfirmDialog(vehicle)}
                            disabled={deletingId === vehicle._id}
                            className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete vehicle"
                          >
                            {deletingId === vehicle._id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, vehicles.length)} of {vehicles.length} vehicles
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPrevious}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <ChevronLeft size={16} />
                      <span>Previous</span>
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {getPageNumbers().map((pageNum, index) => (
                        <button
                          key={index}
                          onClick={() => typeof pageNum === 'number' && goToPage(pageNum)}
                          disabled={pageNum === '...'}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            pageNum === currentPage
                              ? 'bg-blue-600 text-white shadow-sm'
                              : pageNum === '...'
                              ? 'text-gray-400 cursor-default'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={goToNext}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Enhanced Confirmation Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Trash2 size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Confirm Delete</h3>
                  <p className="text-red-100">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete vehicle{' '}
                <span className="font-bold text-gray-900">"{vehicleToDelete?.name}"</span>?
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={closeConfirmDialog}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete(vehicleToDelete._id);
                    closeConfirmDialog();
                  }}
                  disabled={deletingId === vehicleToDelete?._id}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deletingId === vehicleToDelete?._id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehiclesList;