/**
 * HostingRequestsPage — Admin view for Switch-to-Hosting applications
 * Route: /hosting-requests  (head_admin only)
 *
 * Shows all users who applied to become landlords.
 * One tap to approve (grants user_admin role) or reject with a reason.
 *
 * Also shows the payment confirmation queue for manually adding
 * students to lodge groups after offline payment.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const TEAL  = '#00C2A8';
const NAVY  = '#0D1B2A';
const CREAM = '#F5F0E8';
const MUTED = '#8A9BB0';
const CARD  = 'rgba(255,255,255,0.03)';
const BDR   = 'rgba(255,255,255,0.08)';

function timeAgo(d) {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function Badge({ label, color, bg }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: bg, color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {label}
    </span>
  );
}

// ── Request card ──────────────────────────────────────────────────────────────
function RequestCard({ req, onApprove, onReject, approving, rejecting }) {
  const [expanded, setExpanded]     = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason]         = useState('');

  let data = {};
  try { data = JSON.parse(req.hosting_request_data || '{}'); } catch {}

  const statusColors = {
    pending:  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
    approved: { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
    rejected: { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
  };
  const sc = statusColors[req.hosting_request] || statusColors.pending;

  return (
    <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 16, marginBottom: 10, overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${TEAL}18`, border: `1.5px solid ${TEAL}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: TEAL, fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>
          {(req.first_name?.[0] || '') + (req.last_name?.[0] || '')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: CREAM, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {req.first_name} {req.last_name}
          </p>
          <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{req.email}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <Badge label={req.hosting_request} color={sc.color} bg={sc.bg} />
          <span style={{ fontSize: 11, color: MUTED }}>{timeAgo(data.submitted_at || req.created_at)}</span>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${BDR}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            {[
              ['Phone',           data.phone || req.phone || '—'],
              ['Business name',   data.business_name || '—'],
              ['Property address',data.address || '—'],
              ['State',           data.state || '—'],
              ['ID type',         (data.id_type || '').toUpperCase() || '—'],
              ['ID number',       data.id_number ? `••••${data.id_number.slice(-4)}` : '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px' }}>
                <p style={{ fontSize: 10, color: MUTED, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</p>
                <p style={{ fontSize: 13, color: CREAM, margin: 0, wordBreak: 'break-word' }}>{v}</p>
              </div>
            ))}
          </div>

          {data.note && (
            <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, color: MUTED, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Note from applicant</p>
              <p style={{ fontSize: 13, color: CREAM, margin: 0, lineHeight: 1.5 }}>{data.note}</p>
            </div>
          )}

          {req.hosting_request === 'pending' && (
            <>
              {!rejectOpen ? (
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button onClick={() => onApprove(req.id)} disabled={approving}
                    style={{ flex: 1, background: approving ? 'rgba(16,185,129,0.4)' : '#10b981', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 700, cursor: approving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    {approving ? 'Approving…' : '✓ Approve as Landlord'}
                  </button>
                  <button onClick={() => setRejectOpen(true)}
                    style={{ flex: 1, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    ✕ Reject
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 14 }}>
                  <textarea value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="Reason for rejection (sent to the user)…"
                    style={{ width: '100%', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 12px', color: CREAM, fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', resize: 'none', minHeight: 72 }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => setRejectOpen(false)}
                      style={{ flex: 1, background: 'none', border: `1px solid ${BDR}`, color: MUTED, borderRadius: 10, padding: '10px', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      Cancel
                    </button>
                    <button onClick={() => onReject(req.id, reason)} disabled={rejecting}
                      style={{ flex: 2, background: 'rgba(239,68,68,0.7)', border: 'none', color: '#fff', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      {rejecting ? 'Rejecting…' : 'Confirm rejection'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {req.hosting_request === 'approved' && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, fontSize: 13, color: '#10b981' }}>
              ✓ Approved — user has landlord access
            </div>
          )}

          {req.hosting_request === 'rejected' && data.rejection_reason && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, fontSize: 13, color: '#ef4444' }}>
              Rejected: {data.rejection_reason}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Payment confirmation card ─────────────────────────────────────────────────
function PaymentCard({ booking, onConfirm, confirming }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: CREAM, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {booking.student_name || 'Student'}
        </p>
        <p style={{ fontSize: 12, color: MUTED, margin: '0 0 2px' }}>{booking.listing_title || 'Room booking'}</p>
        <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
          ₦{Number(booking.amount || 0).toLocaleString()} · {timeAgo(booking.created_at)}
        </p>
      </div>
      <button onClick={() => onConfirm(booking.id)} disabled={confirming}
        style={{ background: confirming ? `${TEAL}50` : TEAL, color: NAVY, border: 'none', borderRadius: 10, padding: '10px 14px', fontSize: 12, fontWeight: 700, cursor: confirming ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0, whiteSpace: 'nowrap' }}>
        {confirming ? '…' : '✓ Confirm payment'}
      </button>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function HostingRequestsPage() {
  const qc   = useQueryClient();
  const [tab, setTab] = useState('hosting');

  const { data: requests = [], isLoading: loadingReq } = useQuery({
    queryKey: ['hosting-requests'],
    queryFn:  () => api.get('/admin/hosting-requests').then(r => r.data),
  });

  const { data: bookings = [], isLoading: loadingBook } = useQuery({
    queryKey: ['pending-payments'],
    queryFn:  () => api.get('/admin/pending-payments').then(r => r.data).catch(() => []),
  });

  const approve = useMutation({
    mutationFn: id => api.post(`/admin/hosting-requests/${id}/approve`),
    onSuccess:  () => qc.invalidateQueries(['hosting-requests']),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }) => api.post(`/admin/hosting-requests/${id}/reject`, { reason }),
    onSuccess:  () => qc.invalidateQueries(['hosting-requests']),
  });

  const confirmPayment = useMutation({
    mutationFn: id => api.post(`/admin/bookings/${id}/confirm-payment`),
    onSuccess:  () => qc.invalidateQueries(['pending-payments']),
  });

  const pendingReq  = requests.filter(r => r.hosting_request === 'pending');
  const resolvedReq = requests.filter(r => r.hosting_request !== 'pending');

  const TABS = [
    { id: 'hosting',  label: `Hosting Requests ${pendingReq.length > 0 ? `(${pendingReq.length})` : ''}` },
    { id: 'payments', label: `Payment Confirmations ${bookings.length > 0 ? `(${bookings.length})` : ''}` },
  ];

  return (
    <div style={{ padding: '0 0 80px', fontFamily: 'DM Sans, sans-serif', color: CREAM }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: CREAM, margin: '0 0 6px' }}>
          Approvals Queue
        </h1>
        <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
          Review hosting applications and confirm offline payments.
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${BDR}`, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? TEAL : MUTED, borderBottom: `2px solid ${tab === t.id ? TEAL : 'transparent'}`, transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HOSTING REQUESTS ─────────────────────────────────────────────── */}
      {tab === 'hosting' && (
        <>
          {loadingReq ? (
            [...Array(3)].map((_, i) => (
              <div key={i} style={{ height: 72, background: CARD, borderRadius: 16, marginBottom: 10, animation: 'pulse 1.5s infinite' }} />
            ))
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🏠</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: CREAM, margin: '0 0 8px' }}>No hosting requests yet</p>
              <p style={{ fontSize: 14, color: MUTED }}>When students apply to switch to hosting, they'll appear here.</p>
            </div>
          ) : (
            <>
              {pendingReq.length > 0 && (
                <>
                  <p style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                    Pending review ({pendingReq.length})
                  </p>
                  {pendingReq.map(r => (
                    <RequestCard key={r.id} req={r}
                      onApprove={id => approve.mutate(id)}
                      onReject={(id, reason) => reject.mutate({ id, reason })}
                      approving={approve.isPending && approve.variables === r.id}
                      rejecting={reject.isPending && reject.variables?.id === r.id} />
                  ))}
                </>
              )}

              {resolvedReq.length > 0 && (
                <>
                  <p style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '20px 0 10px' }}>
                    Resolved ({resolvedReq.length})
                  </p>
                  {resolvedReq.map(r => (
                    <RequestCard key={r.id} req={r}
                      onApprove={id => approve.mutate(id)}
                      onReject={(id, reason) => reject.mutate({ id, reason })}
                      approving={false}
                      rejecting={false} />
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* ── PAYMENT CONFIRMATIONS ────────────────────────────────────────── */}
      {tab === 'payments' && (
        <>
          <div style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 14, padding: '12px 16px', marginBottom: 18 }}>
            <p style={{ fontSize: 13, color: '#ff6b00', margin: '0 0 4px', fontWeight: 600 }}>🏦 Offline payment flow</p>
            <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.5 }}>
              When a student pays offline (bank transfer or cash), confirm their payment here. This adds them to the lodge group and marks their booking as confirmed.
            </p>
          </div>

          {loadingBook ? (
            [...Array(2)].map((_, i) => (
              <div key={i} style={{ height: 72, background: CARD, borderRadius: 14, marginBottom: 10, animation: 'pulse 1.5s infinite' }} />
            ))
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: CREAM, margin: '0 0 8px' }}>All payments confirmed</p>
              <p style={{ fontSize: 14, color: MUTED }}>Pending payment confirmations will appear here.</p>
            </div>
          ) : (
            bookings.map(b => (
              <PaymentCard key={b.id} booking={b}
                onConfirm={id => confirmPayment.mutate(id)}
                confirming={confirmPayment.isPending && confirmPayment.variables === b.id} />
            ))
          )}
        </>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
