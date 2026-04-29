import { useNavigate, useLocation } from 'react-router-dom';
import { Siren } from '@phosphor-icons/react';
import './EmergencyButton.css';

const HIDE_ON = ['/emergency', '/login', '/register', '/recover', '/onboarding/consent', '/onboarding/persona', '/onboarding/first-mood'];

export default function EmergencyButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <button
      className="emergency-fab"
      onClick={() => navigate('/emergency')}
      aria-label="Emergency — tap for immediate help"
    >
      <Siren size={24} weight="duotone" aria-hidden="true" />
    </button>
  );
}
