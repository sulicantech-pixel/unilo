import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { buildShareLink } from '../lib/utm';
import { useAuthStore } from '../store/authStore';

export default function ListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [saved, setSaved] = useState(false);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => api.get(`/listings/${id}`).then((r) => r.data),
  });

  const handleWishlist = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      const { data } = await api.post(`/listings/${id}/wishlist`);
      setSaved(data.saved);
    } catch (e) { /* noop */ }
  };

  const handleWhatsApp = () => {
    const num = listing.landlord?.phone?.replace(/\D/g, '');
    const msg = encodeURIComponent(`Hi, I saw your listing on Unilo: ${window.location.href}`);
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
    api.post('/analytics/event', {
      event_type: 'whatsapp_click', listing_id: id
    }).catch(() => {});
  };

  const handleShare = async () => {
    const shareUrl = buildShareLink(window.location.href, 'whatsapp');
    if (navigator.share) {
      await navigator.share({ title: listing.title, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied!');
    }
  };

  if (isLoading) return <LoadingSkeleton />;
  if (error || !listing) return (
    <div className="flex flex-col items-center justify-center h-dvh gap-4">
      <p className="text-muted">Listing not found.</p>
      <button className="btn-ghost" onClick={() => navigate(-1)}>Go back</button>
    </div>
  );

  const photos = listing.photos || [];
  const price = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(listing.price);

  return (
    <main className="pb-32">
      {/* ── Back button ──────────────────────────────────────────────────── */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="bg-navy/80 backdrop-blur border border-white/20 rounded-full w-10 h-10 flex items-center justify-center"
        >
          ←
        </button>
      </div>

      {/* ── Photo gallery ────────────────────────────────────────────────── */}
      <div className="relative h-64 sm:h-80 bg-white/5">
        {photos.length > 0 ? (
          <>
            <img
              src={photos[photoIdx]?.url}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIdx(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === photoIdx ? 'bg-brand w-5' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🏠</div>
        )}

        {/* Vacancy badge */}
        <div className="absolute top-16 right-4">
          <span className={`badge ${listing.is_vacant ? 'bg-brand text-navy' : 'bg-white/20 text-muted'}`}>
            {listing.is_vacant ? '✓ Vacant' : 'Occupied'}
          </span>
        </div>
      </div>

      {/* ── Details ──────────────────────────────────────────────────────── */}
      <div className="px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-xl text-cream leading-snug">{listing.title}</h1>
            <p className="text-muted text-sm mt-1">📍 {listing.address}, {listing.city}, {listing.state}</p>
          </div>
          <button onClick={handleWishlist} className="text-2xl mt-0.5 shrink-0">
            {saved ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div>
            <span className="font-display font-bold text-brand text-2xl">{price}</span>
            <span className="text-muted text-sm ml-1">/ {listing.price_period === 'monthly' ? 'month' : 'year'}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { icon: '🛏', label: 'Bedrooms', value: listing.bedrooms },
            { icon: '🚿', label: 'Bathrooms', value: listing.bathrooms },
            { icon: '🏠', label: 'Type', value: listing.type?.replace(/_/g, ' ') },
          ].map(({ icon, label, value }) => (
            <div key={label} className="card p-3 text-center">
              <div className="text-xl">{icon}</div>
              <div className="text-xs text-muted mt-1">{label}</div>
              <div className="font-display font-semibold text-cream text-sm capitalize">{value}</div>
            </div>
          ))}
        </div>

        {/* Amenities */}
        {listing.amenities?.length > 0 && (
          <div className="mt-6">
            <h2 className="font-display font-semibold text-cream mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map((a) => (
                <span key={a} className="badge bg-white/8 text-cream border border-white/10 capitalize">{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {listing.description && (
          <div className="mt-6">
            <h2 className="font-display font-semibold text-cream mb-2">About this place</h2>
            <p className="text-muted text-sm leading-relaxed">{listing.description}</p>
          </div>
        )}

        {/* ── YouTube Video Tour ────────────────────────────────────────── */}
        {listing.youtube_video_id && (
          <div className="mt-8">
            <h2 className="font-display font-semibold text-cream mb-3">🎥 Video Tour</h2>
            <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${listing.youtube_video_id}?autoplay=0&rel=0&modestbranding=1`}
                title={`${listing.title} — Video Tour`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* ── Map placeholder ───────────────────────────────────────────── */}
        {listing.latitude && listing.longitude && (
          <div className="mt-8">
            <h2 className="font-display font-semibold text-cream mb-3">📍 Location</h2>
            <div className="card h-40 flex items-center justify-center text-muted text-sm">
              {/* Leaflet map is loaded here in the full implementation */}
              Map: {listing.latitude}, {listing.longitude}
            </div>
          </div>
        )}

        {/* ── Landlord ──────────────────────────────────────────────────── */}
        {listing.landlord && (
          <div className="mt-6 card p-4">
            <p className="text-muted text-xs mb-1">Listed by</p>
            <p className="font-display font-semibold text-cream">
              {listing.landlord.business_name || listing.landlord.name}
            </p>
          </div>
        )}
      </div>

      {/* ── Fixed CTA bar ────────────────────────────────────────────────── */}
      <div className="fixed bottom-16 left-0 right-0 px-5 pb-4 pt-3 bg-navy/95 backdrop-blur border-t border-white/10 z-40">
        <div className="flex gap-3">
          <button onClick={handleWhatsApp} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <span>💬</span> WhatsApp
          </button>
          <button onClick={handleShare} className="btn-ghost px-4">
            Share
          </button>
        </div>
      </div>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-white/5" />
      <div className="px-5 py-5 space-y-4">
        <div className="h-6 bg-white/5 rounded-xl w-3/4" />
        <div className="h-4 bg-white/5 rounded-xl w-1/2" />
        <div className="h-8 bg-white/5 rounded-xl w-1/3" />
      </div>
    </div>
  );
}
