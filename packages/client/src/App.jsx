import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ListingDetailPage from './pages/ListingDetailPage';  // single merged detail page
import MapPage from './pages/MapPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/"            element={<HomePage />} />
          <Route path="/search"      element={<SearchPage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/map"         element={<MapPage />} />
          <Route path="/wishlist"    element={<WishlistPage />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/register"    element={<RegisterPage />} />
          <Route path="*"            element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>

      {/* Bottom nav — hidden on map page (full-screen), shown everywhere else */}
      <Routes>
        <Route path="/map" element={null} />
        <Route path="*"    element={<BottomNav />} />
      </Routes>
    </div>
  );
}
