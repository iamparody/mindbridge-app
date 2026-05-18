import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import MessageModal from '../components/MessageModal';

const STATUSES = ['pending', 'in_review', 'arranged', 'escalated', 'closed'];

export default function ReferralsTab() {
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [filter,    setFilter]    = useState('');
  const [editing,   setEditing]   = useState(null);
  const [msgTarget, setMsgTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await client.get(`/api/admin/referrals${params}`);
      setItems(data.referrals ?? []);
    } catch { setError('Failed to load referrals.'); }
    finally   { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const filtered = items;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Therapist Referral Inbox</h1>
          <p className="page-subtitle">Users who requested professional referrals</p>
        </div>
        <div className="filter-row">
          <select
            style={{ width: 'auto' }}
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setLoading(true); }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <button className="refresh-btn" onClick={load} title="Refresh">↻</button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <div className="loading">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <p className="empty-text">No referrals found</p>
        </div>
      ) : (
        filtered.map((r) => (
          <div key={r.id} className="referral-card">
            <div className="referral-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="alias">{r.alias}</span>
                <span className={`badge badge--${r.status}`}>{r.status.replace('_', ' ')}</span>
              </div>
              <span className="elapsed">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>

            <div className="referral-card__body">
              <strong style={{ color: 'var(--color-text-primary)' }}>Struggles:</strong> {r.struggles}
              {r.specific_needs && (
                <><br /><strong style={{ color: 'var(--color-text-primary)' }}>Specific needs:</strong> {r.specific_needs}</>
              )}
            </div>

            <div className="referral-card__footer">
              <span className="referral-meta">
                🕐 {r.preferred_time}
              </span>
              <span className="referral-meta">
                📱 {r.contact_method}
              </span>
              {r.admin_notes && (
                <span className="referral-meta" style={{ fontStyle: 'italic' }}>
                  Note: {r.admin_notes}
                </span>
              )}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="btn btn--ghost btn--sm" onClick={() => setEditing(r)}>Update</button>
                <button className="btn btn--ghost btn--sm" onClick={() => setMsgTarget(r.alias)}>Message</button>
              </div>
            </div>
          </div>
        ))
      )}

      {editing && (
        <EditReferralModal referral={editing} onClose={() => { setEditing(null); load(); }} />
      )}
      {msgTarget && <MessageModal alias={msgTarget} onClose={() => setMsgTarget(null)} />}
    </div>
  );
}

function EditReferralModal({ referral, onClose }) {
  const [status, setStatus] = useState(referral.status);
  const [notes,  setNotes]  = useState(referral.admin_notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await client.patch(`/api/admin/referrals/${referral.id}`, { status, admin_notes: notes });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <p className="modal__title">Update Referral — <span style={{ fontFamily: 'monospace' }}>{referral.alias}</span></p>
        <div className="modal__preview">
          <strong>Struggles:</strong> {referral.struggles}<br />
          <strong>Preferred time:</strong> {referral.preferred_time} · <strong>Contact:</strong> {referral.contact_method}
          {referral.specific_needs && <><br /><strong>Specific needs:</strong> {referral.specific_needs}</>}
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Admin Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes visible only to admin…"
            rows={3}
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <div className="modal-footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
