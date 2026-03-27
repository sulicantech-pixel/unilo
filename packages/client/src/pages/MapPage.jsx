// MapPage.jsx
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function MapPage() {
  const { data } = useQuery({
    queryKey: ['listings', 'map'],
    queryFn: () => api.get('/listings?limit=100').then((r) => r.data),
  });

  return (
    <main className="h-dvh pb-16 flex flex-col page-enter">
      <div className="px-5 pt-5 pb-3">
        <h1 className="font-display font-bold text-xl text-cream">Map View</h1>
        <p className="text-muted text-sm">{data?.total ?? '…'} listings</p>
      </div>
      <div className="flex-1 bg-white/5 mx-5 mb-5 rounded-3xl flex items-center justify-center text-muted">
        {/* TODO: mount Leaflet <MapContainer> here with markers for each listing */}
        <div className="text-center">
          <div className="text-5xl mb-3">🗺️</div>
          <p>Leaflet map loads here</p>
          <p className="text-xs mt-1">Install: npm add leaflet react-leaflet</p>
        </div>
      </div>
    </main>
  );
}

// WishlistPage.jsx
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import ListingCard from '../components/ListingCard';

export function WishlistPage() {
  const { isAuthenticated } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/listings/my/wishlist').then((r) => r.data),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-5 text-center page-enter pb-20">
        <div className="text-6xl mb-4">❤️</div>
        <h1 className="font-display font-bold text-xl text-cream mb-2">Save your favourites</h1>
        <p className="text-muted text-sm mb-6">Sign in to keep track of listings you love.</p>
        <Link to="/login" className="btn-primary">Sign in</Link>
      </main>
    );
  }

  return (
    <main className="page-enter pb-24 px-5 pt-6">
      <h1 className="font-display font-bold text-xl text-cream mb-5">Saved Listings</h1>
      {data?.listings?.length === 0 && (
        <div className="text-center py-20 text-muted">
          <div className="text-5xl mb-3">🤍</div>
          <p>No saved listings yet.</p>
          <Link to="/search" className="text-brand text-sm mt-2 block">Browse listings →</Link>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data?.listings?.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    </main>
  );
}

// NotFoundPage.jsx
export function NotFoundPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center text-center px-5 page-enter pb-20">
      <div className="text-8xl mb-4">🏚️</div>
      <h1 className="font-display font-bold text-2xl text-cream mb-2">Page not found</h1>
      <p className="text-muted mb-6">This page doesn't exist or was moved.</p>
      <Link to="/" className="btn-primary">Go home</Link>
    </main>
  );
}

export default MapPage;
