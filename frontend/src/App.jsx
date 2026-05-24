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
                background: 'rgba(15, 25, 35, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                borderRadius: '14px',
                fontSize: '14px',
                fontFamily: 'Cairo, sans-serif',
                direction: 'rtl',
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                maxWidth: '360px',
              },
              success: {
                iconTheme: { primary: '#f59e0b', secondary: '#0d1117' },
                style: {
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#0d1117' },
                style: {
                  border: '1px solid rgba(239, 68, 68, 0.3)',
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
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
