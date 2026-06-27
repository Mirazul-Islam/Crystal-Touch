import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { Home } from './pages/public/Home';
import { Services } from './pages/public/Services';
import { Faq } from './pages/public/Faq';
import { ThankYou } from './pages/public/ThankYou';
import { BookingTracking } from './pages/public/BookingTracking';
import { NotFound } from './pages/public/NotFound';
import { Login } from './pages/auth/Login';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBookingDetail } from './pages/admin/AdminBookingDetail';
import { Cleaners } from './pages/admin/Cleaners';

import { CleanerDashboard } from './pages/cleaner/CleanerDashboard';
import { JobDetail } from './pages/cleaner/JobDetail';

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/booking/:token" element={<BookingTracking />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route
        element={
          <ProtectedRoute allow={['admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/bookings/:id" element={<AdminBookingDetail />} />
        <Route path="/admin/cleaners" element={<Cleaners />} />
      </Route>

      {/* Cleaner */}
      <Route
        element={
          <ProtectedRoute allow={['cleaner']}>
            <DashboardLayout role="cleaner" />
          </ProtectedRoute>
        }
      >
        <Route path="/cleaner" element={<CleanerDashboard />} />
        <Route path="/cleaner/jobs/:id" element={<JobDetail />} />
      </Route>

      <Route path="/index.html" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
