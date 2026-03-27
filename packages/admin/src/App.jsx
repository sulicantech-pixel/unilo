import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from './store/authStore';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PendingListingsPage from './pages/PendingListingsPage';
import AllListingsPage from './pages/AllListingsPage';
import UsersPage from './pages/UsersPage';
import FinancePage from './pages/FinancePage';
import AnalyticsPage from './pages/AnalyticsPage';
import MyListingsPage from './pages/MyListingsPage';
import CreateListingPage from './pages/CreateListingPage';

function RequireAuth({ children, roles }) {
  const { isAuthenticated, user } = useAdminAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAdminAuth();
  const isHeadAdmin = user?.role === 'head_admin';

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={
        <RequireAuth>
          <AdminLayout />
        </RequireAuth>
      }>
        {/* Shared routes */}
        <Route index element={<Navigate to={isHeadAdmin ? '/dashboard' : '/my-listings'} replace />} />
        <Route path="my-listings"    element={<MyListingsPage />} />
        <Route path="listing/new"    element={<CreateListingPage />} />

        {/* Head admin only */}
        <Route path="dashboard"  element={<RequireAuth roles={['head_admin']}><DashboardPage /></RequireAuth>} />
        <Route path="pending"    element={<RequireAuth roles={['head_admin']}><PendingListingsPage /></RequireAuth>} />
        <Route path="listings"   element={<RequireAuth roles={['head_admin']}><AllListingsPage /></RequireAuth>} />
        <Route path="users"      element={<RequireAuth roles={['head_admin']}><UsersPage /></RequireAuth>} />
        <Route path="finance"    element={<RequireAuth roles={['head_admin']}><FinancePage /></RequireAuth>} />
        <Route path="analytics"  element={<RequireAuth roles={['head_admin']}><AnalyticsPage /></RequireAuth>} />
      </Route>
    </Routes>
  );
}
