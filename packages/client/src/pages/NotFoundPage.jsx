import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); *{box-sizing:border-box;}`}</style>
      <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 96, fontWeight: 800, color: 'rgba(255,107,0,0.15)', lineHeight: 1 }}>404</div>
          <div style={{ fontSize: 48, margin: '8px 0 20px' }}>🏚</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>Page not found</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', marginBottom: 28 }}>This page doesn't exist or was moved.</p>
          <button onClick={() => navigate('/')}
            style={{ background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Back to Home
          </button>
        </motion.div>
      </div>
    </>
  );
}
