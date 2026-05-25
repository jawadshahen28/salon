import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QueuePage from './pages/QueuePage';
import AddCustomerPage from './pages/AddCustomerPage';
import PurchasesPage from './pages/PurchasesPage';
import DailyReportPage from './pages/DailyReportPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          {/* Toast notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgba(2, 6, 17, 0.86)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(0, 209, 255, 0.18)',
                color: '#fff',
                borderRadius: '18px',
                fontSize: '14px',
                fontFamily: 'Cairo, sans-serif',
                direction: 'rtl',
                padding: '12px 16px',
                boxShadow: '0 24px 70px rgba(0, 0, 0, 0.45)',
                maxWidth: '360px',
              },
              success: {
                iconTheme: { primary: '#00FFA3', secondary: '#020611' },
                style: {
                  border: '1px solid rgba(0, 255, 163, 0.28)',
                }
              },
              error: {
                iconTheme: { primary: '#FF4D6D', secondary: '#020611' },
                style: {
                  border: '1px solid rgba(255, 77, 109, 0.3)',
                }
              },
            }}
          />

          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/queue" element={<QueuePage />} />
                <Route path="/add-customer" element={<AddCustomerPage />} />
                <Route path="/purchases" element={<PurchasesPage />} />
                <Route path="/daily-report" element={<DailyReportPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
