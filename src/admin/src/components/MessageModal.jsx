import { useState } from 'react';
import client from '../api/client';

export default function MessageModal({ alias, onClose }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    setError('');
    try {
      await client.post(`/api/admin/users/${alias}/message`, { message: message.trim() });
      setSent(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Send in-app message to <span style={{ fontFamily: 'monospace' }}>{alias}</span></h3>
        {sent ? (
          <p style={{ color: 'var(--color-success)', fontWeight: 600 }}>✓ Message sent.</p>
        ) : (
          <>
            <div className="form-group">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message…"
                rows={4}
                autoFocus
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <div className="modal-footer">
              <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSend} disabled={sending || !message.trim()}>
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
