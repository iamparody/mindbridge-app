import { NavLink } from 'react-router-dom';
import { House, BookOpen, SpeakerHigh, Wind, UserCircle } from '@phosphor-icons/react';
import './BottomNav.css';

const tabs = [
  { to: '/dashboard', label: 'Home',      Icon: House },
  { to: '/resources', label: 'Resources', Icon: BookOpen },
  { to: '/sounds',    label: 'Sounds',    Icon: SpeakerHigh },
  { to: '/breathing', label: 'Breathing', Icon: Wind },
  { to: '/profile',   label: 'Profile',   Icon: UserCircle },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `bottom-nav__tab${isActive ? ' active' : ''}`}
          aria-label={label}
        >
          <span className="bottom-nav__icon" aria-hidden="true">
            <Icon size={24} weight="duotone" />
          </span>
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
