import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/Layout/ProtectedLayout';
import UserBooking from './pages/UserBooking';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Payments from './pages/Payments';
import Coupons from './pages/Coupons';
import AdminManagement from './pages/AdminManagement';
import SetPayment from './pages/SetPayment';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public customer facing booking portal at / */}
          <Route path="/" element={<UserBooking />} />

          {/* Administrative staff login */}
          <Route path="/admin/login" element={<Login />} />

          {/* Secure Administrative panel nested under /admin namespace */}
          <Route element={<ProtectedLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/bookings" element={<Bookings />} />
            <Route path="/admin/payments" element={<Payments />} />
            <Route path="/admin/set-payment" element={<SetPayment />} />
            <Route path="/admin/coupons" element={<Coupons />} />
            <Route path="/admin/admins" element={<AdminManagement />} />
            
            {/* Fallback root redirects for namespace /admin */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Global fallback wildcards */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
