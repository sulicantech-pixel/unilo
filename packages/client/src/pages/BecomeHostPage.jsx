/**
 * BecomeHostPage — redirects to the Switch-to-Hosting flow
 * This page is no longer the primary path. Hosting requests now
 * go through the ProfilePage modal (Submit → Admin reviews → Approve).
 *
 * This page catches anyone landing on /become-host and redirects them
 * cleanly, or shows a summary if they're already logged in.
 */
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const BRAND = '#ff6b00';
const GREEN = '#10b981';

const HouseIcon = ({ size = 32, color = BRAND }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const CheckIcon = ({ color = GREEN }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);

const BENEFITS = [
  'Reach thousands of students near your university',
  'No broker fees — list for free',
  'Admin-reviewed to keep the platform trusted',
  'Get added to lodge groups when students book',
  'Track views and inquiries in your dashboard',
];

export default function BecomeHostPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // If already a host → go to admin
  useEffect(() => {
    if (user?.is_host) {
      window.location.href = 'https://unilo-admin.vercel.app';
    }
  }, [user]);

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px 80px' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22,1,0.36,1] }}
        style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}
      >
        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `${BRAND}15`, border: `1px solid ${BRAND}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <HouseIcon size={32} color={BRAND} />
        </div>

        {/* Heading */}
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 900, color: '#f5f0e8', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          List your rooms on Unilo
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', marginBottom: 28, lineHeight: 1.65 }}>
          Reach students actively searching for accommodation near their campus. Hosting is free to apply for.
        </p>

        {/* Benefits */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '16px 20px', marginBottom: 24, textAlign: 'left' }}>
          {BENEFITS.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < BENEFITS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}><CheckIcon /></span>
              <p style={{ fontSize: 13, color: '#f5f0e8', margin: 0, lineHeight: 1.5 }}>{b}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        {isAuthenticated ? (
          <motion.button
            onClick={() => navigate('/profile')}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', background: BRAND, color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            Apply to host in your profile <ArrowRightIcon />
          </motion.button>
        ) : (
          <>
            <motion.button
              onClick={() => navigate('/register?role=landlord')}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ width: '100%', background: BRAND, color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              Sign up as a Landlord <ArrowRightIcon />
            </motion.button>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: BRAND, fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
              {' '}and apply from your profile.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
