import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

// Onboarding step order — redirects to first incomplete step
const ONBOARDING_STEPS = [
  { key: 'consent',    path: '/onboarding/consent' },
  { key: 'persona',    path: '/onboarding/persona' },
  { key: 'first_mood', path: '/onboarding/first-mood' },
];

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  const [onboardingCheck, setOnboardingCheck] = useState({ done: false, redirect: null });

  useEffect(() => {
    if (!token) return;
    const onboardingPaths = ONBOARDING_STEPS.map((s) => s.path);
    const currentlyOnboarding = onboardingPaths.includes(location.pathname);
    if (currentlyOnboarding) {
      setOnboardingCheck({ done: true, redirect: null });
      return;
    }
    client.get('/api/onboarding/status')
      .then(({ data }) => {
        const { consent, persona, first_mood } = data;
        if (!consent) return setOnboardingCheck({ done: true, redirect: '/onboarding/consent' });
        if (!persona) return setOnboardingCheck({ done: true, redirect: '/onboarding/persona' });
        if (!first_mood) return setOnboardingCheck({ done: true, redirect: '/onboarding/first-mood' });
        setOnboardingCheck({ done: true, redirect: null });
      })
      .catch(() => setOnboardingCheck({ done: true, redirect: null }));
  }, [token, location.pathname]);

  if (loading) return <div className="loading-full"><div className="spinner" /></div>;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!onboardingCheck.done) return <div className="loading-full"><div className="spinner" /></div>;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (onboardingCheck.redirect) return <Navigate to={onboardingCheck.redirect} replace />;

  return children;
}
