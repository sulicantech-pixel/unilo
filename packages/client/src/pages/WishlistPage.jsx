import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

// Wishlist is client-side for now; plug into API later
export default function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); *{box-sizing:border-box;}`}</style>
        <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', paddingBottom: 100 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>❤️</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>Save your favourites</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28, lineHeight: 1.6, maxWidth: 280 }}>
            Log in to save listings and compare rooms across Nigeria.
          </p>
          <Link to="/login"
            style={{ background: '#ff6b00', color: '#fff', borderRadius: 12, padding: '13px 32px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
            Log in
          </Link>
          <Link to="/register"
            style={{ marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
            Create a free account →
          </Link>
        </div>
      </>
    );
  }

  // Authenticated but no saved items (plug real data here later)
  const saved = [];

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); *{box-sizing:border-box;}`}</style>
      <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'DM Sans, sans-serif', color: '#fff', paddingBottom: 100 }}>

        {/* Header */}
        <div style={{ padding: '20px 16px 16px', paddingTop: 'max(20px, env(safe-area-inset-top))', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, margin: 0 }}>Saved Rooms</h1>
          {saved.length > 0 && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>{saved.length} rooms saved</p>
          )}
        </div>

        {saved.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}
          >
            <div style={{ fontSize: 56, marginBottom: 20 }}>🏚</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>No saved rooms yet</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28, maxWidth: 280, lineHeight: 1.6 }}>
              Tap the ❤️ on any listing to save it here for later.
            </p>
            <button onClick={() => navigate('/search')}
              style={{ background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Browse listings
            </button>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, padding: 16 }}>
            {saved.map((listing, i) => (
              <motion.div key={listing.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                {/* ListingCard would go here */}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
