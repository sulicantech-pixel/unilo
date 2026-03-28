import { useState, useEffect, useRef, useCallback } from "react";

// ── Analytics Engine ─────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "https://unilo.onrender.com/api";

function useAnalytics() {
  const sessionId = useRef(`sess_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const locationRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          locationRef.current = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
        },
        () => {}
      );
    }
  }, []);

  const track = useCallback((eventType, payload = {}) => {
    try {
      let userId = null;
      try {
        const authRaw = localStorage.getItem("auth-storage");
        if (authRaw) {
          const auth = JSON.parse(authRaw);
          userId = auth?.state?.user?.id || null;
        }
      } catch {}

      const event = {
        eventType,
        sessionId: sessionId.current,
        userId,
        location: locationRef.current,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        ...payload,
      };

      fetch(`${API_BASE}/analytics/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }, []);

  return { track };
}

// ── Intersection Observer hook for scroll tracking ───────────────────────────
function useVisibilityTracker(listingId, track) {
  const ref = useRef(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !trackedRef.current) {
          trackedRef.current = true;
          track("listing_scrolled_past", { listingId });
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [listingId, track]);

  return ref;
}

// ── Scroll Depth Tracker ─────────────────────────────────────────────────────
function useScrollDepth(track) {
  const milestones = useRef(new Set());
  useEffect(() => {
    const handle = () => {
      const pct = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      [25, 50, 75, 90, 100].forEach((m) => {
        if (pct >= m && !milestones.current.has(m)) {
          milestones.current.add(m);
          track("scroll_depth", { depth: m });
        }
      });
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, [track]);
}

// ── Nigerian Universities ─────────────────────────────────────────────────────
const UNIVERSITIES = [
  { id: "unilag", name: "University of Lagos", short: "UNILAG" },
  { id: "uniport", name: "University of Port Harcourt", short: "UNIPORT" },
  { id: "oau", name: "Obafemi Awolowo University", short: "OAU" },
  { id: "unn", name: "University of Nigeria", short: "UNN" },
  { id: "abu", name: "Ahmadu Bello University", short: "ABU" },
  { id: "ui", name: "University of Ibadan", short: "UI" },
  { id: "futa", name: "Federal University of Technology Akure", short: "FUTA" },
  { id: "uniben", name: "University of Benin", short: "UNIBEN" },
  { id: "lasu", name: "Lagos State University", short: "LASU" },
  { id: "unilorin", name: "University of Ilorin", short: "UNILORIN" },
  { id: "covenantuni", name: "Covenant University", short: "CU" },
  { id: "babcock", name: "Babcock University", short: "BABCOCK" },
  { id: "buk", name: "Bayero University Kano", short: "BUK" },
  { id: "unimaid", name: "University of Maiduguri", short: "UNIMAID" },
  { id: "futo", name: "Federal University of Technology Owerri", short: "FUTO" },
  { id: "uniuyo", name: "University of Uyo", short: "UNIUYO" },
  { id: "rsust", name: "Rivers State University", short: "RSU" },
  { id: "eksu", name: "Ekiti State University", short: "EKSU" },
  { id: "ajayi", name: "Ajayi Crowther University", short: "ACU" },
  { id: "pan", name: "Pan-Atlantic University", short: "PAU" },
];

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icons = {
  University: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Campus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
    </svg>
  ),
  Accommodation: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
    </svg>
  ),
  Region: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
    </svg>
  ),
  Junction: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Distance: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Price: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Heart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  HeartFilled: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff6b00" stroke="#ff6b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  Cluster: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Filter: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
    </svg>
  ),
};

// ── Search Field Config ───────────────────────────────────────────────────────
const SEARCH_FIELDS = [
  {
    key: "university", label: "University", icon: "University",
    options: UNIVERSITIES.map((u) => u.name),
    placeholder: "Any university",
  },
  {
    key: "campus", label: "Campus", icon: "Campus",
    options: ["On Campus", "Off Campus", "Near Gate", "Town"],
    placeholder: "Any campus",
  },
  {
    key: "accommodation", label: "Accommodation", icon: "Accommodation",
    options: ["Room", "Roommate", "Self-contain", "Mini flat", "Apartment", "BQ"],
    placeholder: "Any accommodation",
  },
  {
    key: "region", label: "Room Region", icon: "Region",
    options: ["On Campus", "Off Campus", "Near Gate", "Town"],
    placeholder: "Any room region",
  },
  {
    key: "junction", label: "Junction", icon: "Junction",
    options: ["Main Gate", "Back Gate", "School Road", "Market Area", "Town Center"],
    placeholder: "Any junction",
  },
  {
    key: "distance", label: "Distance", icon: "Distance",
    options: ["< 5 min", "5–10 min", "10–20 min", "20–30 min", "> 30 min"],
    placeholder: "Any distance",
  },
  {
    key: "moveIn", label: "Move-in Date", icon: "Calendar",
    type: "date",
    placeholder: "mm/dd/yyyy",
  },
  {
    key: "price", label: "Price / Year", icon: "Price",
    options: ["Under ₦100k", "₦100k–₦200k", "₦200k–₦400k", "₦400k–₦600k", "₦600k–₦1M", "Over ₦1M"],
    placeholder: "Any price / year",
  },
];

// ── Category Tabs ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "all", label: "All" },
  { id: "trending", label: "Trending" },
  { id: "on-campus", label: "On Campus" },
  { id: "off-campus", label: "Off Campus" },
  { id: "clusters", label: "Clusters" },
];

const FILTER_OPTIONS = [
  { id: "near-school", label: "Near School", icon: "MapPin" },
  { id: "by-junction", label: "By Junction", icon: "Junction" },
  { id: "by-size", label: "By Size", icon: "Accommodation" },
  { id: "by-university", label: "By University", icon: "University" },
  { id: "favourites", label: "Favourites", icon: "Heart" },
  { id: "new", label: "New", icon: "Filter" },
];

// ── Listing Card ──────────────────────────────────────────────────────────────
function ListingCard({ listing, track }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const hoverTimer = useRef(null);
  const hoverStart = useRef(null);
  const visRef = useVisibilityTracker(listing.id, track);

  const images = listing.images?.length
    ? listing.images
    : [`https://picsum.photos/seed/${listing.id}/800/600`];

  const handleMouseEnter = () => {
    hoverStart.current = Date.now();
    hoverTimer.current = setTimeout(() => {
      setImgIdx((i) => (i + 1) % images.length);
    }, 800);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    if (hoverStart.current) {
      const duration = Date.now() - hoverStart.current;
      if (duration > 300) {
        track("listing_hover", { listingId: listing.id, durationMs: duration });
      }
      hoverStart.current = null;
    }
  };

  const handleClick = () => {
    track("listing_click", { listingId: listing.id, title: listing.title });
    window.location.href = `/listings/${listing.id}`;
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    const next = !wishlisted;
    setWishlisted(next);
    track("listing_wishlist", { listingId: listing.id, action: next ? "save" : "unsave" });
  };

  return (
    <div
      ref={visRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        cursor: "pointer",
        borderRadius: "16px",
        overflow: "hidden",
        background: "#111",
        border: "1px solid #1a1a1a",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Photo */}
      <div style={{ position: "relative", paddingBottom: "66.67%", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${images[imgIdx]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "transform 6s ease",
          }}
          className="card-img"
        />
        <style>{`
          .card-img { transform: scale(1); }
          div:hover > div > .card-img { transform: scale(1.08) translateX(2%); }
        `}</style>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)",
            border: "none", borderRadius: "50%",
            width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: wishlisted ? "#ff6b00" : "#fff",
            transition: "transform 0.15s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {wishlisted ? <Icons.HeartFilled /> : <Icons.Heart />}
        </button>

        {/* Cluster badge */}
        {listing.isCluster && (
          <div style={{
            position: "absolute", bottom: 12, left: 12,
            background: "#ff6b00", color: "#fff",
            fontSize: 11, fontWeight: 600,
            padding: "4px 10px", borderRadius: 20,
            display: "flex", alignItems: "center", gap: 4,
            fontFamily: "Outfit, sans-serif",
          }}>
            <Icons.Cluster /> Cluster
          </div>
        )}

        {/* Image dots */}
        {images.length > 1 && (
          <div style={{
            position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 4,
          }}>
            {images.map((_, i) => (
              <div key={i} style={{
                width: i === imgIdx ? 16 : 6, height: 6,
                borderRadius: 3, background: i === imgIdx ? "#fff" : "rgba(255,255,255,0.5)",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div style={{
            fontFamily: "Outfit, sans-serif", fontWeight: 600,
            fontSize: 15, color: "#fff",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            maxWidth: "70%",
          }}>
            {listing.title || "Student Room"}
          </div>
          <div style={{
            fontFamily: "Outfit, sans-serif", fontWeight: 700,
            fontSize: 15, color: "#ff6b00", whiteSpace: "nowrap",
          }}>
            ₦{listing.price?.toLocaleString() || "—"}<span style={{ fontWeight: 400, fontSize: 12, color: "#666" }}>/yr</span>
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          color: "#888", fontSize: 13, fontFamily: "Outfit, sans-serif", marginBottom: 6,
        }}>
          <Icons.MapPin />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {listing.location || "Near campus"}
          </span>
        </div>

        <div style={{
          display: "inline-block",
          background: "#1a1a1a", borderRadius: 8,
          padding: "3px 10px",
          fontSize: 12, color: "#aaa",
          fontFamily: "Outfit, sans-serif",
        }}>
          {listing.type || "Room"}
        </div>
      </div>
    </div>
  );
}

// ── Search Modal ──────────────────────────────────────────────────────────────
function SearchModal({ onClose, onSearch, track, selectedUniversity }) {
  const [filters, setFilters] = useState({ university: selectedUniversity?.name || "" });
  const [openField, setOpenField] = useState(null);

  const handleSelect = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setOpenField(null);
  };

  const handleSearch = () => {
    track("search_submit", { filters });
    onSearch(filters);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0f0f0f", borderRadius: 20,
          border: "1px solid #222",
          width: "100%", maxWidth: 720,
          maxHeight: "90vh", overflowY: "auto",
          padding: "28px 28px 24px",
          boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 20, color: "#fff" }}>
              Find your room
            </div>
            <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "#666", marginTop: 2 }}>
              Filter by what matters to you
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#1a1a1a", border: "none", borderRadius: "50%",
              width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
            }}
          >
            <Icons.Close />
          </button>
        </div>

        {/* Fields grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}>
          {SEARCH_FIELDS.map((field) => {
            const Icon = Icons[field.icon];
            const isOpen = openField === field.key;
            const value = filters[field.key];

            return (
              <div key={field.key} style={{ position: "relative" }}>
                <button
                  onClick={() => setOpenField(isOpen ? null : field.key)}
                  style={{
                    width: "100%", background: isOpen ? "#1a1a1a" : "#141414",
                    border: `1px solid ${isOpen ? "#ff6b00" : "#222"}`,
                    borderRadius: 12, padding: "12px 16px",
                    display: "flex", alignItems: "center", gap: 10,
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ color: isOpen ? "#ff6b00" : "#666" }}><Icon /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 10, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                      {field.label}
                    </div>
                    <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 14, color: value ? "#fff" : "#555" }}>
                      {field.type === "date" ? (
                        <input
                          type="date"
                          value={value || ""}
                          onChange={(e) => handleSelect(field.key, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            background: "transparent", border: "none", outline: "none",
                            color: value ? "#fff" : "#555", fontFamily: "Outfit, sans-serif",
                            fontSize: 14, width: "100%", cursor: "pointer",
                          }}
                        />
                      ) : (
                        value || field.placeholder
                      )}
                    </div>
                  </div>
                  {field.type !== "date" && (
                    <span style={{ color: "#444", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                      <Icons.ChevronDown />
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {isOpen && field.options && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 10,
                    background: "#161616", border: "1px solid #2a2a2a", borderRadius: 12,
                    overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                    maxHeight: 220, overflowY: "auto",
                  }}>
                    {field.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleSelect(field.key, opt)}
                        style={{
                          width: "100%", background: "none",
                          border: "none", borderBottom: "1px solid #1e1e1e",
                          padding: "12px 16px", textAlign: "left",
                          fontFamily: "Outfit, sans-serif", fontSize: 14,
                          color: filters[field.key] === opt ? "#ff6b00" : "#ccc",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#1e1e1e")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          style={{
            width: "100%", marginTop: 20,
            background: "#ff6b00", color: "#fff",
            border: "none", borderRadius: 14, padding: "16px",
            fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 16,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "opacity 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Icons.Search /> Search Rooms
        </button>
      </div>
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", background: "#111", border: "1px solid #1a1a1a" }}>
      <div style={{ paddingBottom: "66.67%", background: "#1a1a1a", position: "relative" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }} />
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ height: 16, background: "#1a1a1a", borderRadius: 6, marginBottom: 8, width: "80%" }} />
        <div style={{ height: 13, background: "#1a1a1a", borderRadius: 6, marginBottom: 8, width: "60%" }} />
        <div style={{ height: 24, background: "#1a1a1a", borderRadius: 8, width: "40%" }} />
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

// ── Main HomePage ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const { track } = useAnalytics();
  useScrollDepth(track);

  const [selectedUni, setSelectedUni] = useState(UNIVERSITIES[0]);
  const [uniDropdownOpen, setUniDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const tabsRef = useRef(null);
  const [tabsOffset, setTabsOffset] = useState(0);

  // Measure nav height for sticky offset
  useEffect(() => {
    const nav = document.querySelector("[data-unilo-nav]");
    if (nav) setTabsOffset(nav.offsetHeight);
    else setTabsOffset(64);
  }, []);

  // Fetch listings
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== "all") params.set("category", activeTab);
    if (selectedUni?.id) params.set("university", selectedUni.id);
    Object.entries(activeFilters).forEach(([k, v]) => v && params.set(k, v));

    fetch(`${API_BASE}/listings?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setListings(Array.isArray(data) ? data : data.listings || []);
        setLoading(false);
      })
      .catch(() => {
        setListings([]);
        setLoading(false);
      });
  }, [activeTab, selectedUni, activeFilters]);

  const handleUniSelect = (uni) => {
    setSelectedUni(uni);
    setUniDropdownOpen(false);
    track("university_selected", { universityId: uni.id, universityName: uni.name });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    track("tab_changed", { tab });
  };

  const handleSearch = (filters) => {
    setActiveFilters(filters);
    if (filters.university) {
      const match = UNIVERSITIES.find((u) => u.name === filters.university);
      if (match) setSelectedUni(match);
    }
    track("search_filters_applied", { filters });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "Outfit, sans-serif" }}>

      {/* ── Hero ── */}
      <div style={{ padding: "40px 24px 0", maxWidth: 1280, margin: "0 auto" }}>

        {/* University selector */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
          <button
            onClick={() => setUniDropdownOpen(!uniDropdownOpen)}
            style={{
              background: "#141414", border: "1px solid #2a2a2a",
              borderRadius: 24, padding: "10px 18px",
              display: "flex", alignItems: "center", gap: 10,
              cursor: "pointer", color: "#fff",
              fontFamily: "Outfit, sans-serif", fontWeight: 500, fontSize: 14,
              transition: "border-color 0.2s",
            }}
          >
            <span style={{ color: "#ff6b00" }}><Icons.University /></span>
            <span>{selectedUni.short} — {selectedUni.name.split(" ").slice(0, 3).join(" ")}</span>
            <span style={{ color: "#666", transform: uniDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
              <Icons.ChevronDown />
            </span>
          </button>

          {uniDropdownOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 200,
              background: "#111", border: "1px solid #222", borderRadius: 16,
              width: 340, maxHeight: 320, overflowY: "auto",
              boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
            }}>
              {UNIVERSITIES.map((uni) => (
                <button
                  key={uni.id}
                  onClick={() => handleUniSelect(uni)}
                  style={{
                    width: "100%", background: "none",
                    border: "none", borderBottom: "1px solid #1a1a1a",
                    padding: "13px 18px", textAlign: "left",
                    fontFamily: "Outfit, sans-serif", fontSize: 14,
                    color: selectedUni.id === uni.id ? "#ff6b00" : "#ccc",
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#1a1a1a")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                >
                  <span style={{ fontWeight: 600, color: selectedUni.id === uni.id ? "#ff6b00" : "#ff6b00", marginRight: 8, fontSize: 12 }}>
                    {uni.short}
                  </span>
                  {uni.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "clamp(32px, 5vw, 56px)",
          fontWeight: 700, lineHeight: 1.15,
          color: "#fff", margin: "0 0 6px",
        }}>
          Find a room near{" "}
          <span style={{ color: "#ff6b00" }}>{selectedUni.name}</span>
        </h1>
        <p style={{
          fontFamily: "Outfit, sans-serif",
          fontSize: "clamp(15px, 2vw, 18px)",
          color: "#666", margin: "0 0 36px",
          fontWeight: 400,
        }}>
          Where you feel at home.
        </p>
      </div>

      {/* ── Sticky tabs ── */}
      <div
        ref={tabsRef}
        style={{
          position: "sticky",
          top: tabsOffset,
          zIndex: 90,
          background: "#0a0a0a",
          borderBottom: "1px solid #161616",
          padding: "0 24px",
        }}
      >
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          display: "flex", alignItems: "center", gap: 4,
          overflowX: "auto", paddingBottom: 1,
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                background: activeTab === tab.id ? "#ff6b00" : "none",
                border: "none", borderRadius: 24,
                padding: "10px 18px", whiteSpace: "nowrap",
                fontFamily: "Outfit, sans-serif", fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: 14, color: activeTab === tab.id ? "#fff" : "#888",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}

          {/* Filter dropdown */}
          <div style={{ position: "relative", marginLeft: 4 }}>
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              style={{
                background: filterDropdownOpen ? "#1a1a1a" : "none",
                border: "1px solid #2a2a2a", borderRadius: 24,
                padding: "9px 16px", whiteSpace: "nowrap",
                fontFamily: "Outfit, sans-serif", fontWeight: 500, fontSize: 14,
                color: "#888", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s",
              }}
            >
              <Icons.Filter /> Filter
              <span style={{ transform: filterDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <Icons.ChevronDown />
              </span>
            </button>

            {filterDropdownOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 100,
                background: "#111", border: "1px solid #222", borderRadius: 16,
                width: 200, overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
              }}>
                {FILTER_OPTIONS.map((opt) => {
                  const Icon = Icons[opt.icon] || Icons.Filter;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        track("filter_option_selected", { filter: opt.id });
                        setFilterDropdownOpen(false);
                      }}
                      style={{
                        width: "100%", background: "none",
                        border: "none", borderBottom: "1px solid #1a1a1a",
                        padding: "12px 16px", textAlign: "left",
                        fontFamily: "Outfit, sans-serif", fontSize: 14, color: "#ccc",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                        transition: "background 0.15s",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#1a1a1a")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <span style={{ color: "#666" }}><Icon /></span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Listings Grid ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 120px" }}>

        {/* Section label */}
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 18, color: "#fff" }}>
              {activeTab === "all" ? "All listings" : TABS.find((t) => t.id === activeTab)?.label}
            </div>
            <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "#555", marginTop: 2 }}>
              near {selectedUni.name}
            </div>
          </div>
          {!loading && listings.length > 0 && (
            <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "#555" }}>
              {listings.length} room{listings.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
          }}
            className="listings-grid"
          >
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 24px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 18, color: "#444" }}>
              No listings yet
            </div>
            <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 14, color: "#333" }}>
              Be the first to list a room for students
            </div>
            <a
              href="/listings/new"
              style={{
                marginTop: 8, background: "#ff6b00", color: "#fff",
                borderRadius: 28, padding: "13px 28px",
                fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 15,
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              + List Your Room
            </a>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} track={track} />
            ))}
          </div>
        )}
      </div>

      {/* ── Responsive grid + Amber animation styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,600;0,700;1,600&display=swap');

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        @media (min-width: 640px) {
          .listings-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }

        @media (min-width: 900px) {
          .listings-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
        }

        @media (min-width: 1200px) {
          .listings-grid { grid-template-columns: repeat(4, 1fr); gap: 24px; }
        }

        /* Amber-style photo movement */
        .card-photo-wrap { overflow: hidden; }
        .card-photo-wrap .card-img {
          transform: scale(1.0) translateX(0);
          transition: transform 7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .card-photo-wrap:hover .card-img {
          transform: scale(1.1) translateX(3%);
        }

        ::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>

      {/* ── Sticky floating Search button ── */}
      <div style={{
        position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
        zIndex: 80,
      }}>
        <button
          onClick={() => {
            setSearchModalOpen(true);
            track("search_modal_opened", {});
          }}
          style={{
            background: "#ff6b00",
            color: "#fff", border: "none",
            borderRadius: 28, padding: "14px 28px",
            fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 15,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 8px 32px rgba(255,107,0,0.4)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            whiteSpace: "nowrap",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,107,0,0.5)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,107,0,0.4)";
          }}
        >
          <Icons.Search /> Search Rooms
        </button>
      </div>

      {/* ── Search Modal ── */}
      {searchModalOpen && (
        <SearchModal
          onClose={() => setSearchModalOpen(false)}
          onSearch={handleSearch}
          track={track}
          selectedUniversity={selectedUni}
        />
      )}

      {/* Close dropdowns on outside click */}
      {(uniDropdownOpen || filterDropdownOpen) && (
        <div
          onClick={() => { setUniDropdownOpen(false); setFilterDropdownOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 150 }}
        />
      )}
    </div>
  );
}
