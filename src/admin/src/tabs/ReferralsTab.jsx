import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import MessageModal from '../components/MessageModal';

const STATUSES = ['', 'pending', 'in_review', 'arranged', 'escalated', 'closed'];

export default function ReferralsTab() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filter, setFilter]       = useState('');
  const [editing, setEditing]     = useState(null);
  const [msgTarget, setMsgTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await client.get(`/api/admin/referrals${params}`);
      setItems(data.referrals ?? []);
    } catch { setError('Failed to load referrals.'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const statusBadge = (s) => <span className={`badge badge--${s}`}>{s.replace('_', ' ')}</span>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Therapist Referral Inbox</h1>
        <div className="filters">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setLoading(true); }}>
            <option value="">All statuses</option>
            {STATUSES.slice(1).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <button className="refresh-btn" onClick={load} title="Refresh">↻</button>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <div className="card-body table-wrap">
          {loading ? (
            <div className="loading">Loading…</div>
          ) : items.length === 0 ? (
            <div className="empty"><div className="empty-icon">📋</div>No referrals found</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Alias</th>
                  <th>Struggles</th>
                  <th>Preferred Time</th>
                  <th>Contact Method</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td><span className="alias">{r.alias}</span></td>
                    <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.struggles}</td>
                    <td>{r.preferred_time}</td>
                    <td>{r.contact_method}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td><span className="elapsed">{new Date(r.created_at).toLocaleDateString()}</span></td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn--ghost btn--sm" onClick={() => setEditing(r)}>Update</button>
                        <button className="btn btn--ghost btn--sm" onClick={() => setMsgTarget(r.alias)}>Message</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editing && (
        <EditReferralModal referral={editing} onClose={() => { setEditing(null); load(); }} />
      )}
      {msgTarget && <MessageModal alias={msgTarget} onClose={() => setMsgTarget(null)} />}
    </div>
  );
}

function EditReferralModal({ referral, onClose }) {
  const [status, setStatus]   = useState(referral.status);
  const [notes, setNotes]     = useState(referral.admin_notes ?? '');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

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
        <h3>Update Referral — <span style={{ fontFamily: 'monospace' }}>{referral.alias}</span></h3>
        <div style={{ background: '#f8fafc', borderRadius: 6, padding: '12px 14px', marginBottom: 16, fontSize: 13 }}>
          <strong>Struggles:</strong> {referral.struggles}<br />
          <strong>Preferred time:</strong> {referral.preferred_time} · <strong>Contact:</strong> {referral.contact_method}
          {referral.specific_needs && <><br /><strong>Specific needs:</strong> {referral.specific_needs}</>}
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {['pending','in_review','arranged','escalated','closed'].map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Admin Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes visible only to admin…" rows={3} />
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
