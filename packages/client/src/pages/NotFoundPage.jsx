import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,107,0,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}>

        {/* 404 number */}
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(72px, 20vw, 120px)', fontWeight: 900, color: 'rgba(255,107,0,0.12)', lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 8 }}>
          404
        </div>

        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <HomeIcon />
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#f5f0e8', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          Page not found
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', marginBottom: 32, lineHeight: 1.6, maxWidth: 260 }}>
          This page doesn't exist or was moved. Let's get you back home.
        </p>

        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 14, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeftIcon /> Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
}
