import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ListingPage from './pages/ListingPage';
import MapPage from './pages/MapPage';
import CommunityPage from './pages/CommunityPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BecomeHostPage from './pages/BecomeHostPage';
import NotFoundPage from './pages/NotFoundPage';
import QuickListModal from './components/QuickListModal';
import { useAuthStore } from './store/authStore';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showQuickList, setShowQuickList] = useState(false);
  const location = useLocation();
  const inCommunity = location.pathname === '/community';

  useEffect(() => {
    const handleOpenQuickList = () => {
      setShowQuickList(true);
    };

    window.addEventListener('openQuickList', handleOpenQuickList);
    return () => window.removeEventListener('openQuickList', handleOpenQuickList);
  }, []);

  return (
    <div className="min-h-dvh flex flex-col">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/listing/:id" element={<ListingPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/become-host" element={<BecomeHostPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>

      {/* Mobile bottom nav — always visible */}
      <BottomNav onOpenQuickList={() => setShowQuickList(true)} inCommunity={inCommunity} />

      {/* Quick List Modal */}
      <QuickListModal isOpen={showQuickList} onClose={() => setShowQuickList(false)} />
    </div>
  );
}
