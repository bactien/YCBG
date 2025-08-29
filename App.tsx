import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import QuotationList from './components/QuotationList';
import QuotationForm from './components/QuotationForm';
import CustomerLibrary from './components/CustomerLibrary';
import AluminumLibrary from './components/AluminumLibrary';
import GlassLibrary from './components/GlassLibrary';
import AccessoryLibrary from './components/AccessoryLibrary';
import Dashboard from './components/Dashboard';
import SettingsPage from './components/SettingsPage';
import { Cog6ToothIcon } from './components/Icons';


const App: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 text-sm ${
      isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;
  
  const mainNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-700 hover:text-white'
    }`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);


  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-800">Hệ Thống Quản Lý Báo Giá</h1>
            <nav className="flex items-center space-x-4">
              <NavLink to="/dashboard" className={mainNavLinkClass}>Dashboard</NavLink>
              <NavLink to="/" className={mainNavLinkClass} end>DS Báo Giá</NavLink>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-700 hover:text-white focus:outline-none"
                >
                  Quản lý Dữ liệu
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <NavLink to="/customers" className={navLinkClass}>Khách hàng</NavLink>
                    <NavLink to="/systems" className={navLinkClass}>Hệ nhôm</NavLink>
                    <NavLink to="/glass-types" className={navLinkClass}>Loại kính</NavLink>
                    <NavLink to="/accessories" className={navLinkClass}>Phụ kiện</NavLink>
                  </div>
                )}
              </div>
               <NavLink to="/settings" className={mainNavLinkClass}>
                <span className="flex items-center gap-1">
                  <Cog6ToothIcon className="w-5 h-5" /> Cài đặt
                </span>
               </NavLink>
            </nav>
          </div>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<QuotationList />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<CustomerLibrary />} />
          <Route path="/systems" element={<AluminumLibrary />} />
          <Route path="/glass-types" element={<GlassLibrary />} />
          <Route path="/accessories" element={<AccessoryLibrary />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/new" element={<QuotationForm />} />
          <Route path="/edit/:id" element={<QuotationForm />} />
          <Route path="/view/:data" element={<QuotationForm />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;