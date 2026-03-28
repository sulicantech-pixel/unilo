import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icons = {
  Home: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Heart: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  Plus: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Users: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  User: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Login: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  ),
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Cluster: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Wishlist: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
};

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, href, active, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 4,
        padding: "8px 4px", textDecoration: "none",
        color: active ? "#ff6b00" : "#666",
        transition: "color 0.2s ease",
        minWidth: 0,
      }}
    >
      <Icon />
      <span style={{
        fontFamily: "Outfit, sans-serif",
        fontSize: 10, fontWeight: active ? 600 : 400,
        letterSpacing: "0.02em",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        maxWidth: "100%",
      }}>
        {label}
      </span>
    </a>
  );
}

// ── Main BottomNav ────────────────────────────────────────────────────────────
export default function BottomNav() {
  const user = useAuthStore((s) => s.user);
  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const isActive = (path) => currentPath === path;

  // ── Desktop Top Nav (≥768px) ─────────────────────────────────────────────
  const DesktopNav = (
    <nav
      data-unilo-nav
      style={{
        display: "none",
        position: "sticky", top: 0, zIndex: 200,
        background: "rgba(10,10,10,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid #161616",
        padding: "0 32px", height: 64,
        alignItems: "center", justifyContent: "space-between",
      }}
      className="desktop-nav"
    >
      {/* Logo */}
      <a href="/" style={{
        fontFamily: "'Fraunces', serif",
        fontWeight: 700, fontSize: 26,
        color: "#ff6b00", textDecoration: "none",
        letterSpacing: "-0.02em",
      }}>
        unilo
      </a>

      {/* Center links */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {[
          { label: "Explore", href: "/" },
          { label: "Search", href: "/search" },
          { label: "Clusters", href: "/clusters" },
          { label: "Community", href: "/community" },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={{
              fontFamily: "Outfit, sans-serif", fontSize: 14, fontWeight: 500,
              color: isActive(link.href) ? "#fff" : "#888",
              textDecoration: "none", padding: "8px 14px", borderRadius: 8,
              background: isActive(link.href) ? "#1a1a1a" : "transparent",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => { if (!isActive(link.href)) e.currentTarget.style.color = "#fff"; }}
            onMouseOut={(e) => { if (!isActive(link.href)) e.currentTarget.style.color = "#888"; }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/wishlists" style={{ color: "#888", display: "flex", transition: "color 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#888")}
        >
          <Icons.Wishlist />
        </a>

        {user ? (
          <a
            href="/profile"
            style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "#ff6b00", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 14,
              textDecoration: "none",
            }}
          >
            {user.name?.[0]?.toUpperCase() || "U"}
          </a>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a
              href="/login"
              style={{
                fontFamily: "Outfit, sans-serif", fontWeight: 500, fontSize: 14,
                color: "#888", textDecoration: "none", padding: "8px 14px",
                borderRadius: 8, transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#888")}
            >
              Log in
            </a>
            <a
              href="/listings/new"
              style={{
                fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 14,
                color: "#fff", textDecoration: "none",
                background: "#ff6b00", padding: "9px 18px",
                borderRadius: 24, transition: "opacity 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              List a Room
            </a>
          </div>
        )}
      </div>
    </nav>
  );

  // ── Mobile Bottom Nav (<768px) ────────────────────────────────────────────
  const MobileNav = (
    <nav
      data-unilo-nav
      style={{
        display: "flex",
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(10,10,10,0.96)", backdropFilter: "blur(20px)",
        borderTop: "1px solid #161616",
        height: 72, alignItems: "center",
        padding: "0 8px",
      }}
      className="mobile-nav"
    >
      {user ? (
        // Logged IN — 5 tabs with FAB center
        <>
          <NavItem icon={Icons.Home} label="Explore" href="/" active={isActive("/")} />
          <NavItem icon={Icons.Heart} label="Wishlists" href="/wishlists" active={isActive("/wishlists")} />

          {/* FAB */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <a
              href="/listings/new"
              style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "#ff6b00", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(255,107,0,0.45)",
                transform: "translateY(-8px)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-10px) scale(1.05)";
                e.currentTarget.style.boxShadow = "0 8px 28px rgba(255,107,0,0.55)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(255,107,0,0.45)";
              }}
            >
              <Icons.Plus />
            </a>
          </div>

          <NavItem icon={Icons.Users} label="Community" href="/community" active={isActive("/community")} />
          <NavItem icon={Icons.User} label="Profile" href="/profile" active={isActive("/profile")} />
        </>
      ) : (
        // Logged OUT — 3 tabs
        <>
          <NavItem icon={Icons.Home} label="Explore" href="/" active={isActive("/")} />
          <NavItem icon={Icons.Heart} label="Wishlists" href="/wishlists" active={isActive("/wishlists")} />
          <NavItem icon={Icons.Login} label="Log in" href="/login" active={isActive("/login")} />
        </>
      )}
    </nav>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Fraunces:wght@700&display=swap');
        .desktop-nav { display: none !important; }
        .mobile-nav { display: flex !important; }
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav { display: none !important; }
        }
      `}</style>
      {DesktopNav}
      {MobileNav}
    </>
  );
}
