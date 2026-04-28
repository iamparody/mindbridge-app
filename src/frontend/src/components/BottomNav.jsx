import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const tabs = [
  { to: '/dashboard', label: 'Home',      icon: '🏠' },
  { to: '/resources', label: 'Library',   icon: '📚' },
  { to: '/breathing', label: 'Breathing', icon: '🌬️' },
  { to: '/profile',   label: 'Profile',   icon: '👤' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `bottom-nav__tab${isActive ? ' active' : ''}`}
        >
          <span className="bottom-nav__icon">{tab.icon}</span>
          <span className="bottom-nav__label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
