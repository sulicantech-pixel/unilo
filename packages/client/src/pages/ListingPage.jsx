import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#ff6b00' : 'none'} stroke={filled ? '#ff6b00' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff6b00" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ClusterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const AMENITY_ICONS = {
  'WiFi': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  'Water': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  'Electricity': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  'Security': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  'Generator': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
};

export default function ListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/listings/${id}`)
      .then(r => r.json())
      .then(data => { setListing(data); setLoading(false); })
      .catch(() => setLoading(false));

    // Analytics
    fetch(`${import.meta.env.VITE_API_URL}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'listing_click', listingId: id }),
    }).catch(() => {});
  }, [id]);

  if (loading) return (
    <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#ff6b00] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!listing) return (
    <div className="min-h-dvh bg-[#0a0a0a] flex flex-col items-center justify-center text-center px-6">
      <p className="text-white text-lg font-semibold mb-2">Listing not found</p>
      <p className="text-[#555] text-sm mb-6">This room may have been removed or is no longer available.</p>
      <button onClick={() => navigate('/')} className="bg-[#ff6b00] text-white px-6 py-3 rounded-xl font-semibold text-sm">
        Back to Home
      </button>
    </div>
  );

  const {
    title, price, location, university, photos = [], description,
    accommodationType, distanceFromSchool, isCluster, clusterSpotsLeft,
    clusterPricePerPerson, amenities = [], rules = [], landlordName,
    landlordPhone, landlordWhatsapp, rating, reviewCount, reviews = [],
    yearBuilt, availableFrom, isVerified,
  } = listing;

  const images = photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'];
  const formatPrice = (p) => p ? '₦' + Number(p).toLocaleString('en-NG') : '—';

  const handleWishlist = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setIsWishlisted(w => !w);
  };

  const handleContact = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setContactRevealed(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white">

      {/* Photos */}
      <div className="relative">
        {/* Main photo */}
        <div className="relative w-full overflow-hidden" style={{ paddingBottom: '56.25%' }}>
          <img
            src={images[activePhoto]}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
            <button onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
              <BackIcon />
            </button>
            <div className="flex gap-2">
              <button onClick={handleShare}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
                <ShareIcon />
              </button>
              <button onClick={handleWishlist}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
                <HeartIcon filled={isWishlisted} />
              </button>
            </div>
          </div>

          {/* Photo counter */}
          {images.length > 1 && (
            <button onClick={() => setShowAllPhotos(true)}
              className="absolute bottom-4 right-4 text-xs font-medium text-white bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
              📷 {activePhoto + 1} / {images.length}
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActivePhoto(i)}
                className={`shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition-all ${i === activePhoto ? 'border-[#ff6b00]' : 'border-transparent opacity-60'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-36">

        {/* Title row */}
        <div className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-white text-xl font-semibold font-[Fraunces] leading-snug">{title}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPinIcon />
                <p className="text-[#888] text-sm">{location || university}</p>
              </div>
            </div>
            {rating && (
              <div className="flex items-center gap-1 shrink-0 mt-1">
                <StarIcon />
                <span className="text-white font-semibold text-sm">{rating}</span>
                {reviewCount && <span className="text-[#555] text-xs">({reviewCount})</span>}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {accommodationType && (
              <span className="text-xs text-[#ff6b00] border border-[#ff6b00]/30 px-2.5 py-1 rounded-full">{accommodationType}</span>
            )}
            {distanceFromSchool && (
              <span className="text-xs text-[#888] border border-white/10 px-2.5 py-1 rounded-full">🚶 {distanceFromSchool}</span>
            )}
            {isVerified && (
              <span className="text-xs text-emerald-400 border border-emerald-400/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckIcon /> Verified
              </span>
            )}
            {availableFrom && (
              <span className="text-xs text-[#888] border border-white/10 px-2.5 py-1 rounded-full">Available {availableFrom}</span>
            )}
          </div>
        </div>

        <div className="w-full h-px bg-white/5 my-5" />

        {/* Cluster banner */}
        {isCluster && (
          <div className="bg-[#ff6b00]/10 border border-[#ff6b00]/20 rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-[#ff6b00]"><ClusterIcon /></div>
              <p className="text-[#ff6b00] font-semibold text-sm">Cluster Available</p>
              <span className="text-xs text-[#ff6b00]/70 ml-auto">{clusterSpotsLeft} spot{clusterSpotsLeft !== 1 ? 's' : ''} left</span>
            </div>
            <p className="text-[#ccc] text-sm leading-relaxed">
              Split this room with a compatible student. Pay{' '}
              <span className="text-[#ff6b00] font-semibold">{formatPrice(clusterPricePerPerson)}</span> each instead of the full rent.
              Unilo handles matching and payment.
            </p>
            <button className="mt-3 w-full bg-[#ff6b00] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#e55f00] transition-colors">
              Join Cluster
            </button>
          </div>
        )}

        {/* Price */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[#555] text-xs mb-1">Annual rent</p>
            <p className="text-3xl font-bold text-white">{formatPrice(price)}</p>
            <p className="text-[#555] text-xs mt-0.5">per year</p>
          </div>
          {isCluster && clusterPricePerPerson && (
            <div className="text-right">
              <p className="text-[#555] text-xs mb-1">Per person (Cluster)</p>
              <p className="text-xl font-bold text-[#ff6b00]">{formatPrice(clusterPricePerPerson)}</p>
            </div>
          )}
        </div>

        <div className="w-full h-px bg-white/5 my-5" />

        {/* Description */}
        {description && (
          <>
            <div className="mb-5">
              <h2 className="text-white font-semibold mb-2">About this room</h2>
              <p className="text-[#888] text-sm leading-relaxed">{description}</p>
            </div>
            <div className="w-full h-px bg-white/5 my-5" />
          </>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <>
            <div className="mb-5">
              <h2 className="text-white font-semibold mb-3">What's included</h2>
              <div className="grid grid-cols-2 gap-2">
                {amenities.map(amenity => (
                  <div key={amenity} className="flex items-center gap-2.5 bg-[#111] rounded-xl px-3 py-2.5">
                    <span className="text-[#ff6b00]">{AMENITY_ICONS[amenity] || <CheckIcon />}</span>
                    <span className="text-white text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full h-px bg-white/5 my-5" />
          </>
        )}

        {/* House rules */}
        {rules.length > 0 && (
          <>
            <div className="mb-5">
              <h2 className="text-white font-semibold mb-3">House rules</h2>
              <ul className="space-y-2">
                {rules.map(rule => (
                  <li key={rule} className="flex items-start gap-2.5 text-sm text-[#888]">
                    <span className="text-[#555] mt-0.5">—</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full h-px bg-white/5 my-5" />
          </>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <>
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-white font-semibold">Reviews</h2>
                <div className="flex items-center gap-1">
                  <StarIcon />
                  <span className="text-white text-sm font-medium">{rating}</span>
                  <span className="text-[#555] text-xs">· {reviewCount} reviews</span>
                </div>
              </div>
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review, i) => (
                  <div key={i} className="bg-[#111] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#ff6b00]/20 flex items-center justify-center text-[#ff6b00] text-xs font-bold">
                        {(review.name || 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{review.name || 'Anonymous'}</p>
                        <p className="text-[#555] text-xs">{review.date || ''}</p>
                      </div>
                    </div>
                    <p className="text-[#888] text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full h-px bg-white/5 my-5" />
          </>
        )}

        {/* Landlord */}
        {landlordName && (
          <div className="mb-5">
            <h2 className="text-white font-semibold mb-3">Listed by</h2>
            <div className="flex items-center gap-3 bg-[#111] rounded-2xl p-4">
              <div className="w-11 h-11 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-white font-bold">
                {landlordName[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{landlordName}</p>
                <p className="text-[#555] text-xs">Landlord · Unilo verified</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/5 px-4 py-4 pb-safe">
        <div className="flex gap-3 max-w-lg mx-auto">
          {contactRevealed ? (
            <div className="flex-1 flex gap-2">
              {landlordPhone && (
                <a href={`tel:${landlordPhone}`}
                  className="flex-1 bg-[#1a1a1a] border border-white/10 text-white text-sm font-semibold py-3.5 rounded-xl text-center hover:bg-[#222] transition-colors">
                  📞 Call
                </a>
              )}
              {landlordWhatsapp && (
                <a href={`https://wa.me/${landlordWhatsapp}`} target="_blank" rel="noreferrer"
                  className="flex-1 bg-emerald-600 text-white text-sm font-semibold py-3.5 rounded-xl text-center hover:bg-emerald-700 transition-colors">
                  WhatsApp
                </a>
              )}
            </div>
          ) : (
            <button onClick={handleContact}
              className="flex-1 bg-[#ff6b00] text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-[#e55f00] transition-colors">
              {isAuthenticated ? 'Show Contact' : 'Login to Contact'}
            </button>
          )}
          {isCluster && !contactRevealed && (
            <button className="flex-1 border border-[#ff6b00] text-[#ff6b00] text-sm font-semibold py-3.5 rounded-xl hover:bg-[#ff6b00]/10 transition-colors">
              Join Cluster
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
