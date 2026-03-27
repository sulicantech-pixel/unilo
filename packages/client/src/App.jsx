import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ListingPage from './pages/ListingPage';
import MapPage from './pages/MapPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuthStore } from './store/authStore';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="min-h-dvh flex flex-col">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/"            element={<HomePage />} />
          <Route path="/search"      element={<SearchPage />} />
          <Route path="/listing/:id" element={<ListingPage />} />
          <Route path="/map"         element={<MapPage />} />
          <Route path="/wishlist"    element={<WishlistPage />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/register"    element={<RegisterPage />} />
          <Route path="*"            element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>

      {/* Mobile bottom nav — always visible */}
      <BottomNav />
    </div>
  );
}
