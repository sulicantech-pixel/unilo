import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function BecomeHostPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [step, setStep] = useState(1); // 1: verify, 2: contact, 3: bank, 4: complete
  const [formData, setFormData] = useState({
    // Step 2: Contact
    phone: user?.phone || '',
    whatsapp: '',
    contactPreference: 'both', // phone, whatsapp, both

    // Step 3: Banking
    bankName: '',
    accountNumber: '',
    accountHolderName: user?.name || '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const becomeHostMutation = useMutation({
    mutationFn: () =>
      api.post('/auth/become-host', {
        ...formData,
        userId: user?.id,
      }),
    onSuccess: (response) => {
      setSuccess('✅ You are now a host! Manage your listings and start earning.');
      setStep(4);
      setTimeout(() => navigate('/'), 3000);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to become a host');
    },
  });

  const handleFieldChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    setError('');
  };

  // ─── STEP 1: VERIFY EMAIL ───────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-dvh bg-navy flex items-center justify-center p-4 pb-24">
        <div className="max-w-md w-full">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">Step 1 of 4</span>
              <span className="text-xs text-brand font-semibold">25%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-1/4 bg-brand transition-all" />
            </div>
          </div>

          <h1 className="font-display font-bold text-2xl text-cream mb-2">
            Become a Host
          </h1>
          <p className="text-muted text-sm mb-6">
            List your property and start earning with Unilo
          </p>

          {/* Info Box */}
          <div className="bg-brand/10 border border-brand/30 rounded-lg p-4 mb-6">
            <p className="text-cream text-sm font-medium mb-2">
              ✓ Email verified
            </p>
            <p className="text-muted text-xs">{user?.email}</p>
          </div>

          {/* Next Button */}
          <button
            onClick={() => setStep(2)}
            className="w-full bg-brand hover:bg-brand/90 text-navy font-semibold py-3 rounded-lg transition"
          >
            Continue
          </button>

          <p className="text-muted text-xs text-center mt-4">
            We'll help you set up your hosting account in just a few minutes
          </p>
        </div>
      </div>
    );
  }

  // ─── STEP 2: CONTACT INFORMATION ────────────────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-dvh bg-navy flex items-center justify-center p-4 pb-24">
        <div className="max-w-md w-full">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">Step 2 of 4</span>
              <span className="text-xs text-brand font-semibold">50%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-brand transition-all" />
            </div>
          </div>

          <h1 className="font-display font-bold text-2xl text-cream mb-2">
            Contact Information
          </h1>
          <p className="text-muted text-sm mb-6">
            How should we reach you about your listings?
          </p>

          {/* Form */}
          <div className="space-y-4 mb-6">
            {/* Phone */}
            <div>
              <label className="text-xs text-muted block mb-1.5">Phone</label>
              <input
                type="tel"
                placeholder="+234 801 234 5678"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream placeholder-muted/50"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="text-xs text-muted block mb-1.5">
                WhatsApp (optional)
              </label>
              <input
                type="tel"
                placeholder="+234 801 234 5678"
                value={formData.whatsapp}
                onChange={(e) =>
                  handleFieldChange('whatsapp', e.target.value)
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream placeholder-muted/50"
              />
            </div>

            {/* Contact Preference */}
            <div>
              <label className="text-xs text-muted block mb-2">
                How should we contact you?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'phone', label: '📱 Phone' },
                  { value: 'whatsapp', label: '💬 WhatsApp' },
                  { value: 'both', label: '🔔 Both' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white/5"
                  >
                    <input
                      type="radio"
                      name="preference"
                      value={option.value}
                      checked={formData.contactPreference === option.value}
                      onChange={(e) =>
                        handleFieldChange('contactPreference', e.target.value)
                      }
                      className="w-4 h-4 accent-brand"
                    />
                    <span className="text-cream text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-danger text-sm bg-danger/10 p-3 rounded mb-4">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-cream py-3 rounded-lg transition"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!formData.phone) {
                  setError('Phone number is required');
                  return;
                }
                setStep(3);
              }}
              className="flex-1 bg-brand hover:bg-brand/90 text-navy font-semibold py-3 rounded-lg transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 3: BANKING INFORMATION ────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-dvh bg-navy flex items-center justify-center p-4 pb-24">
        <div className="max-w-md w-full">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">Step 3 of 4</span>
              <span className="text-xs text-brand font-semibold">75%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-brand transition-all" />
            </div>
          </div>

          <h1 className="font-display font-bold text-2xl text-cream mb-2">
            Banking Details
          </h1>
          <p className="text-muted text-sm mb-6">
            Where should we send your earnings?
          </p>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-6 text-xs text-blue-300">
            🔒 Your banking information is encrypted and secure
          </div>

          {/* Form */}
          <div className="space-y-4 mb-6">
            {/* Bank Name */}
            <div>
              <label className="text-xs text-muted block mb-1.5">
                Bank Name
              </label>
              <input
                type="text"
                placeholder="e.g. Access Bank, GTBank"
                value={formData.bankName}
                onChange={(e) => handleFieldChange('bankName', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream placeholder-muted/50"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="text-xs text-muted block mb-1.5">
                Account Number
              </label>
              <input
                type="text"
                placeholder="10 digits"
                value={formData.accountNumber}
                onChange={(e) =>
                  handleFieldChange('accountNumber', e.target.value)
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream placeholder-muted/50"
              />
            </div>

            {/* Account Holder */}
            <div>
              <label className="text-xs text-muted block mb-1.5">
                Account Holder Name
              </label>
              <input
                type="text"
                value={formData.accountHolderName}
                onChange={(e) =>
                  handleFieldChange('accountHolderName', e.target.value)
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream placeholder-muted/50"
              />
            </div>
          </div>

          {error && (
            <p className="text-danger text-sm bg-danger/10 p-3 rounded mb-4">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-cream py-3 rounded-lg transition"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!formData.bankName || !formData.accountNumber) {
                  setError('All fields are required');
                  return;
                }
                setStep(4);
              }}
              className="flex-1 bg-brand hover:bg-brand/90 text-navy font-semibold py-3 rounded-lg transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 4: CONFIRMATION ───────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="min-h-dvh bg-navy flex items-center justify-center p-4 pb-24">
        <div className="max-w-md w-full text-center">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">Step 4 of 4</span>
              <span className="text-xs text-brand font-semibold">100%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-full bg-brand transition-all" />
            </div>
          </div>

          {becomeHostMutation.isPending ? (
            <>
              <div className="text-5xl mb-4">⏳</div>
              <h1 className="font-display font-bold text-2xl text-cream mb-2">
                Setting up your account...
              </h1>
              <p className="text-muted text-sm">Just one moment</p>
            </>
          ) : success ? (
            <>
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="font-display font-bold text-2xl text-cream mb-2">
                Welcome to Unilo Hosts!
              </h1>
              <p className="text-muted text-sm mb-6">
                {success}
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-brand hover:bg-brand/90 text-navy font-semibold py-3 rounded-lg transition"
              >
                Go to Dashboard
              </button>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">✓</div>
              <h1 className="font-display font-bold text-2xl text-cream mb-2">
                Ready to start hosting?
              </h1>
              <p className="text-muted text-sm mb-6">
                Your account is all set up. Start by listing your first property.
              </p>

              <button
                onClick={() => becomeHostMutation.mutate()}
                disabled={becomeHostMutation.isPending}
                className="w-full bg-brand hover:bg-brand/90 text-navy font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {becomeHostMutation.isPending ? 'Completing...' : 'Complete Setup'}
              </button>

              {error && (
                <p className="text-danger text-sm bg-danger/10 p-3 rounded mt-4">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}
