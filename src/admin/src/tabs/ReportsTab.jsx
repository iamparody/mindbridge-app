import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';

export default function ReportsTab() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [acting, setActing]   = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await client.get('/api/admin/reports');
      setItems(data.reports ?? []);
    } catch { setError('Failed to load reports.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Group Reports Queue</h1>
        <button className="refresh-btn" onClick={load} title="Refresh">↻</button>
      </div>
      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <div className="card-body table-wrap">
          {loading ? (
            <div className="loading">Loading…</div>
          ) : items.length === 0 ? (
            <div className="empty"><div className="empty-icon">🛡️</div>No pending reports</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Reported</th>
                  <th>Reporter</th>
                  <th>Reason</th>
                  <th>Message Preview</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.group_name}</td>
                    <td><span className="alias">{r.reported_alias}</span></td>
                    <td><span className="alias" style={{ color: 'var(--color-text-muted)' }}>{r.reporter_alias}</span></td>
                    <td><span className="badge badge--pending">{r.reason}</span></td>
                    <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                      "{r.message_preview}"
                    </td>
                    <td><span className="elapsed">{new Date(r.created_at).toLocaleDateString()}</span></td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn--ghost btn--sm" onClick={() => setActing({ report: r, action: 'dismiss' })}>Dismiss</button>
                        <button className="btn btn--warning btn--sm" onClick={() => setActing({ report: r, action: 'warn' })}>Warn</button>
                        <button className="btn btn--danger btn--sm" onClick={() => setActing({ report: r, action: 'ban' })}>Ban</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {acting && (
        <ActionModal
          report={acting.report}
          action={acting.action}
          onClose={() => setActing(null)}
          onDone={() => { setActing(null); load(); }}
        />
      )}
    </div>
  );
}

function ActionModal({ report, action, onClose, onDone }) {
  const [notes, setNotes]   = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const labels = { dismiss: 'Dismiss Report', warn: 'Warn User', ban: 'Ban User' };
  const btnClass = { dismiss: 'btn--ghost', warn: 'btn--warning', ban: 'btn--danger' };

  async function handleConfirm() {
    setSaving(true);
    setError('');
    try {
      await client.patch(`/api/admin/reports/${report.id}/action`, {
        action,
        admin_notes: notes.trim() || undefined,
      });
      onDone();
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{labels[action]}</h3>
        <div style={{ background: '#f8fafc', borderRadius: 6, padding: '12px 14px', marginBottom: 16, fontSize: 13 }}>
          <strong>Group:</strong> {report.group_name}<br />
          <strong>Reported user:</strong> <span style={{ fontFamily: 'monospace' }}>{report.reported_alias}</span><br />
          <strong>Reason:</strong> {report.reason}<br />
          {report.message_preview && <><strong>Message:</strong> <em>"{report.message_preview}"</em></>}
        </div>
        {action !== 'dismiss' && (
          <div className="form-group">
            <label className="form-label">Notes {action === 'warn' ? '(sent to user)' : '(reason)'}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={action === 'warn' ? 'Warning message to the user…' : 'Reason for ban…'}
              rows={3}
              autoFocus
            />
          </div>
        )}
        {error && <p className="error-text">{error}</p>}
        <div className="modal-footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className={`btn ${btnClass[action]}`} onClick={handleConfirm} disabled={saving}>
            {saving ? 'Working…' : `Confirm ${labels[action]}`}
          </button>
        </div>
      </div>
    </div>
  );
}
