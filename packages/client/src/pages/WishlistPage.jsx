import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import ListingCard from '../components/ListingCard';
import BottomNav from '../components/BottomNav';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    fetch(`${import.meta.env.VITE_API_URL}/users/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const list = data.listings || data || [];
        setListings(list);
        setWishlistIds(list.map(l => l.id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return (
    <div className="min-h-dvh bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center pb-24">
      <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </div>
      <h2 className="text-white font-semibold text-lg mb-2">Log in to see your wishlist</h2>
      <p className="text-[#555] text-sm mb-6">Save rooms you love and come back to them anytime.</p>
      <button onClick={() => navigate('/login')} className="bg-[#ff6b00] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#e55f00] transition-colors">
        Log in
      </button>
      <BottomNav />
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white">
      <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 px-4 py-4 pt-14">
        <h1 className="text-white text-xl font-bold font-[Fraunces]">Wishlist</h1>
        {listings.length > 0 && <p className="text-[#555] text-xs mt-0.5">{listings.length} saved room{listings.length !== 1 ? 's' : ''}</p>}
      </div>

      <div className="px-4 pb-28 pt-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-2xl bg-[#1a1a1a]" style={{ paddingBottom: '66.67%' }} />
                <div className="mt-2 h-3 bg-[#1a1a1a] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">No saved rooms yet</p>
            <p className="text-[#555] text-sm mb-5">Tap the heart on any listing to save it here.</p>
            <button onClick={() => navigate('/')} className="text-sm font-medium text-[#ff6b00] border border-[#ff6b00]/30 px-5 py-2.5 rounded-full hover:bg-[#ff6b00]/10 transition-colors">
              Browse rooms
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                wishlistIds={wishlistIds}
                onWishlistToggle={(id) => {
                  setWishlistIds(prev => prev.filter(x => x !== id));
                  setListings(prev => prev.filter(l => l.id !== id));
                }}
              />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
