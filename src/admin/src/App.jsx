import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen    from './components/LoginScreen';
import EmergencyTab   from './tabs/EmergencyTab';
import EscalationsTab from './tabs/EscalationsTab';
import ReferralsTab   from './tabs/ReferralsTab';
import ReportsTab     from './tabs/ReportsTab';
import RiskTab        from './tabs/RiskTab';
import ContentTab     from './tabs/ContentTab';
import StatsTab       from './tabs/StatsTab';

const TABS = [
  { id: 'emergency',   label: 'Emergency',    icon: '🚨' },
  { id: 'escalations', label: 'Escalations',  icon: '⚡' },
  { id: 'referrals',   label: 'Referrals',    icon: '📋' },
  { id: 'reports',     label: 'Reports',      icon: '🛡️' },
  { id: 'risk',        label: 'Risk Flags',   icon: '⚠️' },
  { id: 'content',     label: 'Content',      icon: '📚' },
  { id: 'stats',       label: 'Stats',        icon: '📊' },
];

function AdminShell() {
  const { admin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('emergency');
  const [emergencyCount, setEmergencyCount] = useState(0);

  const renderTab = () => {
    switch (activeTab) {
      case 'emergency':   return <EmergencyTab onCountChange={setEmergencyCount} />;
      case 'escalations': return <EscalationsTab />;
      case 'referrals':   return <ReferralsTab />;
      case 'reports':     return <ReportsTab />;
      case 'risk':        return <RiskTab />;
      case 'content':     return <ContentTab />;
      case 'stats':       return <StatsTab />;
      default:            return null;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__brand-title">🧠 MindBridge</div>
          <div className="sidebar__brand-sub">Admin Panel</div>
        </div>
        <nav className="sidebar__nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`sidebar__item${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="sidebar__item-icon">{tab.icon}</span>
              {tab.label}
              {tab.id === 'emergency' && emergencyCount > 0 && (
                <span className="sidebar__badge">{emergencyCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar__footer">
          Signed in as <strong>{admin?.alias}</strong>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <header className="topbar">
          <span className="topbar__title">
            {TABS.find((t) => t.id === activeTab)?.icon}&nbsp;
            {TABS.find((t) => t.id === activeTab)?.label}
          </span>
          <div className="topbar__right">
            <span>{admin?.alias}</span>
            <button className="btn btn--ghost btn--sm" onClick={logout}>Sign out</button>
          </div>
        </header>
        <main className="content">{renderTab()}</main>
      </div>
    </div>
  );
}

function AppInner() {
  const { admin, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#64748b' }}>Loading…</div>;
  return admin ? <AdminShell /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
