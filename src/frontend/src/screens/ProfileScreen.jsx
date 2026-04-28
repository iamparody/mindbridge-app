import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const PACKAGES = [
  { id: 'starter',  label: 'Starter',  price: 50,  credits: 3 },
  { id: 'standard', label: 'Standard', price: 100, credits: 7 },
  { id: 'plus',     label: 'Plus',     price: 200, credits: 15 },
  { id: 'support',  label: 'Support',  price: 500, credits: 40 },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifPrefs, setNotifPrefs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasing, setPurchasing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profRes, balRes, txRes, notifRes] = await Promise.all([
        client.get('/api/profile'),
        client.get('/api/credits/balance'),
        client.get('/api/credits/transactions'),
        client.get('/api/notifications'),
      ]);
      setProfile(profRes.data);
      setBalance(balRes.data.balance ?? 0);
      setTransactions(txRes.data.transactions ?? txRes.data ?? []);
      const notifList = notifRes.data.notifications ?? notifRes.data ?? [];
      setNotifications(notifList);
      setNotifPrefs({
        peer_broadcast: profRes.data.notif_peer_broadcast ?? true,
        checkin_reminder: profRes.data.notif_checkin_reminder ?? true,
        group_messages: profRes.data.notif_group_messages ?? true,
        credit_low: profRes.data.notif_credit_low ?? true,
      });
    } catch {
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handlePurchase(pkg) {
    setPurchasing(pkg.id);
    try {
      const { data } = await client.post('/api/credits/purchase', { package: pkg.id });
      if (data.payment_url) window.location.href = data.payment_url;
    } catch (err) {
      setError(err.response?.data?.error || 'Could not initiate purchase.');
    } finally {
      setPurchasing(null);
    }
  }

  async function updateNotifPref(key, value) {
    setNotifPrefs((p) => ({ ...p, [key]: value }));
    try {
      await client.patch('/api/notifications/preferences', { [key]: value });
    } catch {
      setNotifPrefs((p) => ({ ...p, [key]: !value })); // revert on failure
    }
  }

  async function handleDeleteData() {
    setDeleting(true);
    try {
      await client.post('/api/profile/delete-data');
      logout();
      navigate('/login', { replace: true });
    } catch {
      setError('Could not schedule deletion. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }

  async function handleClearJournal() {
    if (!window.confirm('Delete all journal entries permanently? This cannot be undone.')) return;
    try {
      await client.delete('/api/journals');
    } catch {
      setError('Could not clear journal. Please try again.');
    }
  }

  async function handleFeedbackSubmit() {
    setSendingFeedback(true);
    try {
      await client.post('/api/feedback', { type: feedbackType, rating: feedbackRating || undefined, comment: feedbackComment.trim() || undefined });
      setFeedbackSent(true);
      setTimeout(() => { setFeedbackOpen(false); setFeedbackSent(false); setFeedbackRating(0); setFeedbackComment(''); }, 2000);
    } catch {
      setError('Could not send feedback.');
    } finally {
      setSendingFeedback(false);
    }
  }

  async function handleLogout() {
    try { await client.post('/api/auth/logout'); } catch { /* best-effort */ }
    logout();
    navigate('/login', { replace: true });
  }

  if (loading) return <div className="loading-full"><div className="spinner" /></div>;

  const balanceLow = balance !== null && balance < 2;
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="screen" style={{ padding: '0 0 16px' }}>
      <div className="page-header">
        <h2 className="page-header__title">Profile</h2>
        {unreadCount > 0 && (
          <span style={{ marginLeft: 'auto', background: 'var(--color-emergency)', color: '#fff', borderRadius: 999, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700 }}>
            {unreadCount} new
          </span>
        )}
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {error && <div className="error-msg">{error}</div>}

        {/* Account */}
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>My Account</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Alias</span>
              <span style={{ fontWeight: 700 }}>{user?.alias || profile?.alias}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Email</span>
              <span style={{ fontSize: '0.9rem' }}>{profile?.masked_email || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Streak</span>
              <span style={{ fontWeight: 600 }}>{profile?.streak_count ?? 0} 🔥</span>
            </div>
          </div>
        </div>

        {/* AI Companion */}
        {profile?.persona && (
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>My AI Companion</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Name</span>
                <span style={{ fontWeight: 600 }}>{profile.persona.persona_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Tone</span>
                <span style={{ textTransform: 'capitalize' }}>{profile.persona.tone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Style</span>
                <span style={{ textTransform: 'capitalize' }}>{profile.persona.response_style}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Formality</span>
                <span style={{ textTransform: 'capitalize' }}>{profile.persona.formality}</span>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: 10 }}>Your companion's identity was set at signup and cannot be changed.</p>
          </div>
        )}

        {/* Credits */}
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Credits</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Balance</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: balanceLow ? 'var(--color-emergency)' : 'var(--color-text)' }}>{balance ?? '—'}</div>
              {balanceLow && <div style={{ fontSize: '0.75rem', color: 'var(--color-emergency)' }}>Low — top up to continue peer sessions</div>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handlePurchase(pkg)}
                disabled={!!purchasing}
                style={{
                  padding: '10px 8px', borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--color-border)', background: 'var(--color-white)',
                  cursor: 'pointer', textAlign: 'center',
                  opacity: purchasing && purchasing !== pkg.id ? 0.5 : 1,
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{pkg.credits} cr</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>KSh {pkg.price}</div>
                {purchasing === pkg.id && <div style={{ fontSize: '0.7rem' }}>Loading…</div>}
              </button>
            ))}
          </div>
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>{new Date(tx.created_at).toLocaleDateString()}</span>
              <span style={{ textTransform: 'capitalize', color: 'var(--color-text-muted)' }}>{tx.type}</span>
              <span style={{ fontWeight: 600, color: tx.type === 'debit' ? 'var(--color-emergency)' : 'var(--color-success)' }}>
                {tx.type === 'debit' ? '-' : '+'}{tx.amount} cr
              </span>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Notifications</h3>
          {[
            { key: 'peer_broadcast', label: 'Peer request broadcasts' },
            { key: 'checkin_reminder', label: 'Daily check-in reminder' },
            { key: 'group_messages', label: 'Group messages' },
            { key: 'credit_low', label: 'Low balance alerts' },
          ].map(({ key, label }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.9rem' }}>{label}</span>
              <input
                type="checkbox"
                checked={notifPrefs[key] ?? true}
                onChange={(e) => updateNotifPref(key, e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
              />
            </label>
          ))}
        </div>

        {/* Privacy & Data */}
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Privacy & Data</h3>
          {profile?.consent_version && (
            <p style={{ fontSize: '0.85rem', marginBottom: 12 }}>
              Consent v{profile.consent_version} accepted {profile.consented_at ? new Date(profile.consented_at).toLocaleDateString() : ''}
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn--muted btn--sm" onClick={handleClearJournal}>Clear My Journal</button>
            {deleteConfirm ? (
              <div>
                <p style={{ fontSize: '0.85rem', marginBottom: 8, color: 'var(--color-emergency)' }}>
                  This will delete all your data within 24 hours. Are you sure?
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn--danger btn--sm" onClick={handleDeleteData} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Yes, delete everything'}
                  </button>
                  <button className="btn btn--muted btn--sm" onClick={() => setDeleteConfirm(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="btn btn--danger btn--sm" onClick={() => setDeleteConfirm(true)}>Delete My Data</button>
            )}
          </div>
        </div>

        {/* Safety Plan quick link */}
        <button className="btn btn--ghost" onClick={() => navigate('/safety-plan')}>🛡️ My Safety Plan</button>

        {/* Feedback */}
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>App Feedback</h3>
          {feedbackOpen ? (
            feedbackSent ? (
              <p style={{ textAlign: 'center', color: 'var(--color-success)' }}>✅ Thank you for your feedback!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <select className="select" value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)}>
                  <option value="general">General</option>
                  <option value="peer_session">Peer Session</option>
                  <option value="ai_chat">AI Chat</option>
                  <option value="bug">Bug Report</option>
                </select>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button" onClick={() => setFeedbackRating(s)} style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', opacity: s <= feedbackRating ? 1 : 0.3 }}>⭐</button>
                  ))}
                </div>
                <textarea className="textarea" rows={3} maxLength={300} value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} placeholder="Optional comment…" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn--primary btn--sm" onClick={handleFeedbackSubmit} disabled={sendingFeedback}>
                    {sendingFeedback ? 'Sending…' : 'Send'}
                  </button>
                  <button className="btn btn--muted btn--sm" onClick={() => setFeedbackOpen(false)}>Cancel</button>
                </div>
              </div>
            )
          ) : (
            <button className="btn btn--ghost btn--sm" onClick={() => setFeedbackOpen(true)}>Send Feedback</button>
          )}
        </div>

        {/* Logout */}
        <button className="btn btn--muted" onClick={handleLogout}>Sign Out</button>
      </div>
    </div>
  );
}
