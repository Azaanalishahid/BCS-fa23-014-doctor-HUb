import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboards
import PatientDashboard from './pages/dashboards/PatientDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import AssistantDashboard from './pages/dashboards/AssistantDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';

// Shared Sub-pages
import Profile from './pages/dashboards/Profile';

// Patient Sub-pages
import PatientHome from './pages/dashboards/PatientHome';
import PatientSearch from './pages/dashboards/PatientSearch';
import PatientHistory from './pages/dashboards/PatientHistory';

// Doctor Sub-pages
import DoctorSearch from './pages/dashboards/DoctorSearch';
import DoctorHistory from './pages/dashboards/DoctorHistory';

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case 'Patient': return <Navigate to="/patient" />;
    case 'Doctor': return <Navigate to="/doctor" />;
    case 'Assistant': return <Navigate to="/assistant" />;
    case 'Admin': return <Navigate to="/admin" />;
    case 'Super Admin': return <Navigate to="/superadmin" />;
    default: return <Navigate to="/login" />;
  }
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/" element={<RootRedirect />} />

          {/* Patient Routes */}
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <PatientHome />
            </ProtectedRoute>
          } />
          <Route path="/patient/search" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <PatientSearch />
            </ProtectedRoute>
          } />
          <Route path="/patient/history" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <PatientHistory />
            </ProtectedRoute>
          } />
          <Route path="/patient/profile" element={
            <ProtectedRoute allowedRoles={['Patient']}>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/search" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorSearch />
            </ProtectedRoute>
          } />
          <Route path="/doctor/history" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <DoctorHistory />
            </ProtectedRoute>
          } />
          <Route path="/doctor/profile" element={
            <ProtectedRoute allowedRoles={['Doctor']}>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Assistant Routes */}
          <Route path="/assistant" element={
            <ProtectedRoute allowedRoles={['Assistant']}>
              <AssistantDashboard />
            </ProtectedRoute>
          } />
          <Route path="/assistant/profile" element={
            <ProtectedRoute allowedRoles={['Assistant']}>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Super Admin Routes */}
          <Route path="/superadmin/*" element={
            <ProtectedRoute allowedRoles={['Super Admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
