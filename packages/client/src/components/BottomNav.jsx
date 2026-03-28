import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function BottomNav() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const handleAddListing = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // If logged in, go to admin to create listing
    window.location.href = 'https://unilo-admin.vercel.app';
  };

  const navStyle = (isActive) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 4px 8px',
    gap: '3px',
    color: isActive ? '#ff6b00' : 'rgba(255,255,255,0.45)',
    textDecoration: 'none',
    transition: 'color 0.2s',
    fontFamily: "'DM Sans', sans-serif",
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  });

  const iconStyle = { fontSize: '20px', lineHeight: 1 };
  const labelStyle = { fontSize: '10px', fontWeight: 500 };

  if (!user) {
    // LOGGED OUT: Explore, Wishlists, Profile
    return (
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <NavLink to="/" end style={({ isActive }) => navStyle(isActive)}>
          <span style={iconStyle}>🔍</span>
          <span style={labelStyle}>Explore</span>
        </NavLink>

        <NavLink to="/wishlist" style={({ isActive }) => navStyle(isActive)}>
          <span style={iconStyle}>❤️</span>
          <span style={labelStyle}>Wishlists</span>
        </NavLink>

        <NavLink to="/login" style={({ isActive }) => navStyle(isActive)}>
          <span style={iconStyle}>👤</span>
          <span style={labelStyle}>Log in</span>
        </NavLink>
      </nav>
    );
  }

  // LOGGED IN: Explore, Wishlists, Add, Community, Profile
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <NavLink to="/" end style={({ isActive }) => navStyle(isActive)}>
        <span style={iconStyle}>🔍</span>
        <span style={labelStyle}>Explore</span>
      </NavLink>

      <NavLink to="/wishlist" style={({ isActive }) => navStyle(isActive)}>
        <span style={iconStyle}>❤️</span>
        <span style={labelStyle}>Wishlists</span>
      </NavLink>

      {/* Add listing button */}
      <button onClick={handleAddListing} style={navStyle(false)}>
        <span style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: '#ff6b00', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '20px', marginBottom: '2px',
          boxShadow: '0 4px 12px rgba(255,107,0,0.4)',
        }}>+</span>
        <span style={labelStyle}>Add</span>
      </button>

      <NavLink to="/community" style={({ isActive }) => navStyle(isActive)}>
        <span style={iconStyle}>👥</span>
        <span style={labelStyle}>Community</span>
      </NavLink>

      <NavLink to="/profile" style={({ isActive }) => navStyle(isActive)}>
        <span style={iconStyle}>👤</span>
        <span style={labelStyle}>Profile</span>
      </NavLink>
    </nav>
  );
}
