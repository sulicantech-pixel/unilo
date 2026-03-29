import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-dvh bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[#ff6b00] text-6xl font-bold font-[Fraunces] mb-4">404</p>
      <h1 className="text-white text-xl font-semibold mb-2">Page not found</h1>
      <p className="text-[#555] text-sm mb-8">This page doesn't exist or was moved.</p>
      <button onClick={() => navigate('/')} className="bg-[#ff6b00] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#e55f00] transition-colors">
        Go home
      </button>
    </div>
  );
}
