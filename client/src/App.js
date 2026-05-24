import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import React from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from "./pages/Dashboard";
import CreateGroup from "./pages/CreateGroup";
import AddExpense from './pages/AddExpense';
import ViewExpenses from './pages/ViewExpenses';
import Settlements from './pages/Settlements';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import AdminDashboard from './admin/AdminDashboard';
import AdminLogin from './admin/pages/AdminLogin';
import Users from './admin/pages/Users';
import Groups from './admin/pages/Groups';
import Expenses from './admin/pages/Expenses';
import AdminSettlements from './admin/pages/Settlements';
import Reports from './admin/pages/Reports';
import Notifications from './admin/pages/Notifications';
import Feedback from './admin/pages/Feedback';
import Settings from './admin/pages/Settings';
import ActivityLogs from './admin/pages/ActivityLogs';
import Unauthorized from './admin/pages/Unauthorized';
import AdminHome from './admin/pages/Dashboard';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
            <Route
              path="/create-group"
              element={<CreateGroup />}
            />
            <Route
              path='/add-expense'
              element={<AddExpense />}
            />
            <Route
              path='/expenses/:groupId'
              element={<ViewExpenses />}
            />
            <Route path='/settlements' element={<Navigate to='/settlement' replace />} />
            <Route
              path='/settlement'
              element={<Settlements />}
            />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<AdminHome />} />
              <Route path="dashboard" element={<AdminHome />} />
              <Route path="users" element={<Users />} />
              <Route path="groups" element={<Groups />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="settlements" element={<AdminSettlements />} />
              <Route path="reports" element={<Reports />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="settings" element={<Settings />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
            </Route>
          </Route>
          <Route path="/admin/unauthorized" element={<Unauthorized />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;