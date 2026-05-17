import client from '../api/client';

// Fire-and-forget — never throws, never blocks the caller
export function trackEvent(event_name, properties = {}) {
  client.post('/api/analytics/event', { event_name, properties }).catch(() => {});
}
