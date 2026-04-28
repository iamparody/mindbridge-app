import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const DEFAULT_PLAN = {
  warning_signs: '',
  helpful_things: '',
  things_to_avoid: '',
  contacts: [
    { name: '', contact_detail: '' },
    { name: '', contact_detail: '' },
    { name: '', contact_detail: '' },
  ],
  emergency_resources: 'Befrienders Kenya: 0800 723 253 (free, 24/7)',
  reason_to_keep_going: '',
};

export default function SafetyPlanScreen() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await client.get('/api/safety-plan');
      if (data) {
        setPlan({
          ...DEFAULT_PLAN,
          ...data,
          contacts: data.contacts?.length
            ? [...data.contacts, ...Array(Math.max(0, 3 - data.contacts.length)).fill({ name: '', contact_detail: '' })]
            : DEFAULT_PLAN.contacts,
        });
      }
    } catch {
      setError('Failed to load safety plan. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function updateField(field, value) {
    setPlan((p) => ({ ...p, [field]: value }));
  }

  function updateContact(index, field, value) {
    setPlan((p) => {
      const contacts = [...p.contacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...p, contacts };
    });
  }

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...plan,
        contacts: plan.contacts.filter((c) => c.name.trim()),
      };
      await client.put('/api/safety-plan', payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="loading-full"><div className="spinner" /></div>;

  return (
    <div className="screen" style={{ padding: '0 0 16px' }}>
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Back">‹</button>
        <h2 className="page-header__title">My Safety Plan</h2>
      </div>

      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: '#EBF4FF', border: '1px solid #C7D8F5', borderRadius: 'var(--radius-sm)', padding: 12, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
          📋 Write this during a calm moment — it's here for you when things get hard. All fields are optional and completely private.
        </div>

        {error && <div className="error-msg">{error}</div>}

        {[
          { field: 'warning_signs', label: '1. Warning signs I notice in myself', placeholder: 'e.g. withdrawing from people, difficulty sleeping…' },
          { field: 'helpful_things', label: '2. Things that have helped me before', placeholder: 'e.g. calling a friend, going for a walk…' },
          { field: 'things_to_avoid', label: '3. Things that make it worse — to avoid', placeholder: 'e.g. isolating, social media at night…' },
        ].map(({ field, label, placeholder }) => (
          <div key={field}>
            <label className="label">{label}</label>
            <textarea
              className="textarea"
              rows={3}
              value={plan[field]}
              onChange={(e) => updateField(field, e.target.value)}
              placeholder={placeholder}
            />
          </div>
        ))}

        <div>
          <label className="label">4. People I can contact (up to 3)</label>
          {plan.contacts.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                type="text"
                className="input"
                value={c.name}
                onChange={(e) => updateContact(i, 'name', e.target.value)}
                placeholder={`Person ${i + 1} name`}
              />
              <input
                type="text"
                className="input"
                value={c.contact_detail}
                onChange={(e) => updateContact(i, 'contact_detail', e.target.value)}
                placeholder="Contact (phone/email)"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="label">5. Emergency contacts &amp; resources</label>
          <textarea
            className="textarea"
            rows={2}
            value={plan.emergency_resources}
            onChange={(e) => updateField('emergency_resources', e.target.value)}
          />
        </div>

        <div>
          <label className="label">6. One thing that gives me a reason to keep going</label>
          <textarea
            className="textarea"
            rows={2}
            value={plan.reason_to_keep_going}
            onChange={(e) => updateField('reason_to_keep_going', e.target.value)}
            placeholder="What matters most to you?"
          />
        </div>

        <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : saved ? '✅ Saved' : 'Save Safety Plan'}
        </button>

        <button className="btn btn--danger" onClick={() => navigate('/emergency')}>
          🆘 Emergency — I need help now
        </button>
      </div>
    </div>
  );
}
