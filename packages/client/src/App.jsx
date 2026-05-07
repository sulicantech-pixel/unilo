import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ListingPage from './pages/ListingPage';
import ListingDetailPage from './pages/ListingDetailPage';
import MapPage from './pages/MapPage';
import CommunityPage from './pages/CommunityPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BecomeHostPage from './pages/BecomeHostPage';
import NotFoundPage from './pages/NotFoundPage';
import QuickListModal from './components/QuickListModal';
import { useAuthStore } from './store/authStore';

// Pages that should NOT show the bottom nav
const NO_NAV_ROUTES = ['/login', '/register', '/become-host'];

export default function App() {
  const { isAuthenticated, hydrate } = useAuthStore();
  const [showQuickList, setShowQuickList] = useState(false);
  const location = useLocation();
  const inCommunity = location.pathname === '/community';
  const showNav = !NO_NAV_ROUTES.includes(location.pathname);

  // Rehydrate JWT on mount
  useEffect(() => { hydrate(); }, []);

  // Listen for FAB openQuickList events dispatched anywhere
  useEffect(() => {
    const handler = () => setShowQuickList(true);
    window.addEventListener('openQuickList', handler);
    return () => window.removeEventListener('openQuickList', handler);
  }, []);

  return (
    <div className="min-h-dvh flex flex-col">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"              element={<HomePage />} />
          <Route path="/search"        element={<SearchPage />} />
          <Route path="/listing/:id"   element={<ListingDetailPage />} />
          <Route path="/map"           element={<MapPage />} />
          <Route path="/community"     element={<CommunityPage />} />
          <Route path="/wishlist"      element={<WishlistPage />} />
          <Route path="/profile"       element={<ProfilePage />} />
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/register"      element={<RegisterPage />} />
          <Route path="/become-host"   element={<BecomeHostPage />} />
          <Route path="*"              element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>

      {showNav && (
        <BottomNav onOpenQuickList={() => setShowQuickList(true)} inCommunity={inCommunity} />
      )}

      <QuickListModal isOpen={showQuickList} onClose={() => setShowQuickList(false)} />
    </div>
  );
}
