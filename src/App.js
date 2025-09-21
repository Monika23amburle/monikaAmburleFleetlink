// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import AddVehicle from './components/AddVehicle';
import SearchAndBook from './components/SearchAndBook';
import ViewBookings from './components/ViewBookings';
import VehiclesList from './components/VehiclesList';
import { Truck, Search, Calendar, Users, BarChart3, Settings } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
        
        {/* Enhanced Colorful Sidebar */}
<nav className="w-72 bg-gradient-to-b from-indigo-900 via-purple-800 to-indigo-800 shadow-2xl flex-shrink-0 fixed top-0 left-0 h-full overflow-auto z-50">          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
          
          {/* Header */}
          <div className="relative flex items-center h-20 px-6 border-b border-white/20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="text-white" size={24} />
              </div>
              <div className="ml-4">
                <span className="font-bold text-xl text-white">FleetLink</span>
                <p className="text-blue-200 text-sm">Logistics Management</p>
              </div>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="relative py-8 px-4 flex flex-col space-y-2">
            <NavLink
              to="/vehicles"
              className={({ isActive }) => 
                `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30' 
                    : 'text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1'
                }`
              }
            >
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mr-4 shadow-md group-hover:scale-105 transition-transform">
                <Truck size={20} className="text-white" />
              </div>
              <div>
                <span className="font-medium text-base">Vehicles</span>
                <p className="text-xs opacity-70">Manage your fleet</p>
              </div>
            </NavLink>

            <NavLink
              to="/search-book"
              className={({ isActive }) => 
                `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30' 
                    : 'text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1'
                }`
              }
            >
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center mr-4 shadow-md group-hover:scale-105 transition-transform">
                <Search size={20} className="text-white" />
              </div>
              <div>
                <span className="font-medium text-base">Search & Book</span>
                <p className="text-xs opacity-70">Find available vehicles</p>
              </div>
            </NavLink>

            <NavLink
              to="/view-bookings"
              className={({ isActive }) => 
                `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30' 
                    : 'text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1'
                }`
              }
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mr-4 shadow-md group-hover:scale-105 transition-transform">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <span className="font-medium text-base">View Bookings</span>
                <p className="text-xs opacity-70">Track reservations</p>
              </div>
            </NavLink>

          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto ml-72">
          {/* Header Bar */}
          <div className="bg-white/70 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Fleet Management Dashboard
                </h1>
                <p className="text-gray-500 text-sm">Manage your logistics operations efficiently</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium text-sm">System Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">
            <Routes>
              <Route path="/add-vehicle" element={<AddVehicle />} />
              <Route path="/edit-vehicle/:id" element={<AddVehicle />} />
              <Route path="/search-book" element={<SearchAndBook />} />
              <Route path="/view-bookings" element={<ViewBookings />} />
              <Route path="/vehicles" element={<VehiclesList />} />
              <Route path="/" element={<VehiclesList />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;