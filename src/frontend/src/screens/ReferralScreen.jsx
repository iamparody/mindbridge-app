import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const TIMES = ['morning', 'afternoon', 'evening'];
const METHODS = ['in_app', 'phone'];

export default function ReferralScreen() {
  const navigate = useNavigate();
  const [struggles, setStruggles] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [phone, setPhone] = useState('');
  const [specificNeeds, setSpecificNeeds] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!struggles.trim()) { setError('Please describe what you are struggling with.'); return; }
    if (!preferredTime) { setError('Please select a preferred contact time.'); return; }
    if (!contactMethod) { setError('Please select a contact method.'); return; }
    if (contactMethod === 'phone' && !phone.trim()) { setError('Please enter your phone number.'); return; }
    setError('');
    setLoading(true);
    try {
      await client.post('/api/referrals', {
        struggles: struggles.trim(),
        preferred_time: preferredTime,
        contact_method: contactMethod,
        contact_detail: contactMethod === 'phone' ? phone.trim() : undefined,
        specific_needs: specificNeeds.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ marginBottom: 8 }}>Request received</h2>
        <p>Your request has been received. We'll be in touch within 24 hours.</p>
        <button className="btn btn--primary" style={{ marginTop: 32 }} onClick={() => navigate('/dashboard')}>Back to home</button>
      </div>
    );
  }

  return (
    <div className="screen" style={{ padding: '0 0 16px' }}>
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">Therapist Referral</h2>
      </div>

      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="info-banner">
          We'll connect you with a qualified mental health professional. An admin will reach out to arrange your session based on your preferences.
        </div>

        <div>
          <label className="label" htmlFor="struggles">What are you struggling with? <span style={{ color: 'var(--color-danger)' }}>*</span></label>
          <textarea
            id="struggles"
            className="textarea"
            rows={4}
            maxLength={500}
            value={struggles}
            onChange={(e) => setStruggles(e.target.value)}
            placeholder="Share as much or as little as you're comfortable with…"
          />
          <div className={`char-counter${struggles.length > 480 ? ' char-counter--over' : ''}`}>{struggles.length}/500</div>
        </div>

        <div>
          <label className="label">Preferred contact time <span style={{ color: 'var(--color-danger)' }}>*</span></label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {TIMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPreferredTime(t)}
                className={`pill${preferredTime === t ? ' pill--active' : ''}`}
                style={{ cursor: 'pointer', border: 'none', flex: 1, textTransform: 'capitalize' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Preferred contact method <span style={{ color: 'var(--color-danger)' }}>*</span></label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setContactMethod('in_app')} className={`pill${contactMethod === 'in_app' ? ' pill--active' : ''}`} style={{ cursor: 'pointer', border: 'none', flex: 1 }}>💬 In-app message</button>
            <button type="button" onClick={() => setContactMethod('phone')} className={`pill${contactMethod === 'phone' ? ' pill--active' : ''}`} style={{ cursor: 'pointer', border: 'none', flex: 1 }}>📞 Phone call</button>
          </div>
          {contactMethod === 'phone' && (
            <div style={{ marginTop: 10 }}>
              <label className="label" htmlFor="phone">Phone number</label>
              <input
                id="phone"
                type="tel"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 7XX XXX XXX"
              />
              <p style={{ fontSize: '0.75rem', marginTop: 4 }}>Stored encrypted. Deleted after your session is arranged.</p>
            </div>
          )}
        </div>

        <div>
          <label className="label" htmlFor="needs">Any specific needs? <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span></label>
          <textarea
            id="needs"
            className="textarea"
            rows={2}
            value={specificNeeds}
            onChange={(e) => setSpecificNeeds(e.target.value)}
            placeholder="e.g. language preference, availability, topic focus…"
          />
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button
          className="btn btn--primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting…' : 'Submit Request'}
        </button>
      </div>
    </div>
  );
}
