import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/adminDashboard';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminRoomManagement from './pages/admin/AdminRoomManagement';
import Analytics from './pages/admin/Analytics';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <SocketProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/admin/rooms" element={<AdminRoomManagement />} />
              <Route path="/admin/analytics" element={<Analytics />} />
            </Routes>
          </SocketProvider>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
