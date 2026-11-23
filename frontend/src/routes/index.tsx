import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { MainLayout } from '../components/layout/MainLayout';

// Auth Pages
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';

// Requester & Common Request Pages
import { RequestListPage } from '../features/requests/RequestListPage';
import { CreateRequestPage } from '../features/requests/CreateRequestPage';
import { RequestDetailPage } from '../features/requests/RequestDetailPage';

// Manager Pages
import { ManagerPendingQueuePage } from '../features/manager/ManagerPendingQueuePage';
import { ManagerTeamRequestsPage } from '../features/manager/ManagerTeamRequestsPage';

// Technician Pages
import { TechnicianMyTasksPage } from '../features/technician/TechnicianMyTasksPage';

// Admin Pages
import { AdminUsersPage } from '../features/admin/AdminUsersPage';
import { AdminLocationsPage } from '../features/admin/AdminLocationsPage';
import { AdminAssetsPage } from '../features/admin/AdminAssetsPage';
import { AdminCategoriesPage } from '../features/admin/AdminCategoriesPage';

// Dashboard
import { DashboardSummaryPage } from '../features/dashboard/DashboardSummaryPage';

const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'MANAGER') return <Navigate to="/manager/queue" replace />;
  if (user.role === 'TECHNICIAN') return <Navigate to="/technician/my-tasks" replace />;
  return <Navigate to="/requests" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<RootRedirect />} />

              {/* Requests (Common & Requester) */}
              <Route path="/requests" element={<RequestListPage />} />
              <Route path="/requests/new" element={<CreateRequestPage />} />
              <Route path="/requests/:id" element={<RequestDetailPage />} />

              {/* Manager Routes */}
              <Route element={<RoleRoute allowedRoles={['MANAGER']} />}>
                <Route path="/manager/queue" element={<ManagerPendingQueuePage />} />
                <Route path="/manager/team-requests" element={<ManagerTeamRequestsPage />} />
                <Route path="/dashboard" element={<DashboardSummaryPage />} />
              </Route>

              {/* Technician Routes */}
              <Route element={<RoleRoute allowedRoles={['TECHNICIAN']} />}>
                <Route path="/technician/my-tasks" element={<TechnicianMyTasksPage />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<DashboardSummaryPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/locations" element={<AdminLocationsPage />} />
                <Route path="/admin/assets" element={<AdminAssetsPage />} />
                <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
