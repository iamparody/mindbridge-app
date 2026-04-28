import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';
import EmergencyButton from './components/EmergencyButton';

// Auth
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import RecoverScreen from './screens/auth/RecoverScreen';

// Onboarding
import ConsentScreen from './screens/onboarding/ConsentScreen';
import PersonaScreen from './screens/onboarding/PersonaScreen';
import FirstMoodScreen from './screens/onboarding/FirstMoodScreen';

// Main screens
import DashboardScreen from './screens/DashboardScreen';
import MoodCheckinScreen from './screens/MoodCheckinScreen';
import AIChatScreen from './screens/AIChatScreen';
import JournalScreen from './screens/JournalScreen';
import GroupsScreen from './screens/GroupsScreen';
import GroupDetailScreen from './screens/GroupDetailScreen';
import GroupAgreementScreen from './screens/GroupAgreementScreen';
import GroupChatScreen from './screens/GroupChatScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import SafetyPlanScreen from './screens/SafetyPlanScreen';
import ReferralScreen from './screens/ReferralScreen';
import ResourcesScreen from './screens/ResourcesScreen';
import ArticleScreen from './screens/ArticleScreen';
import BreathingScreen from './screens/BreathingScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminDashboard from './screens/admin/AdminDashboard';

// Peer
import PeerRequestScreen from './screens/peer/PeerRequestScreen';
import PeerWaitingScreen from './screens/peer/PeerWaitingScreen';
import PeerTextChatScreen from './screens/peer/PeerTextChatScreen';
import PeerVoiceCallScreen from './screens/peer/PeerVoiceCallScreen';

const HIDE_NAV_ON = [
  '/login', '/register', '/recover',
  '/onboarding', '/ai-chat', '/peer/session',
  '/emergency',
];

function Layout() {
  const { pathname } = useLocation();
  const { token } = useAuth();
  const hideNav = !token || HIDE_NAV_ON.some((p) => pathname.startsWith(p));

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/recover" element={<RecoverScreen />} />

        {/* Onboarding */}
        <Route path="/onboarding/consent"    element={<ProtectedRoute><ConsentScreen /></ProtectedRoute>} />
        <Route path="/onboarding/persona"    element={<ProtectedRoute><PersonaScreen /></ProtectedRoute>} />
        <Route path="/onboarding/first-mood" element={<ProtectedRoute><FirstMoodScreen /></ProtectedRoute>} />

        {/* Main app */}
        <Route path="/dashboard"   element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
        <Route path="/mood"        element={<ProtectedRoute><MoodCheckinScreen /></ProtectedRoute>} />
        <Route path="/ai-chat"     element={<ProtectedRoute><AIChatScreen /></ProtectedRoute>} />
        <Route path="/journal"     element={<ProtectedRoute><JournalScreen /></ProtectedRoute>} />
        <Route path="/groups"      element={<ProtectedRoute><GroupsScreen /></ProtectedRoute>} />
        <Route path="/groups/:id"  element={<ProtectedRoute><GroupDetailScreen /></ProtectedRoute>} />
        <Route path="/groups/:id/agree" element={<ProtectedRoute><GroupAgreementScreen /></ProtectedRoute>} />
        <Route path="/groups/:id/chat"  element={<ProtectedRoute><GroupChatScreen /></ProtectedRoute>} />
        <Route path="/emergency"   element={<ProtectedRoute><EmergencyScreen /></ProtectedRoute>} />
        <Route path="/safety-plan" element={<ProtectedRoute><SafetyPlanScreen /></ProtectedRoute>} />
        <Route path="/referral"    element={<ProtectedRoute><ReferralScreen /></ProtectedRoute>} />
        <Route path="/resources"   element={<ProtectedRoute><ResourcesScreen /></ProtectedRoute>} />
        <Route path="/resources/:id" element={<ProtectedRoute><ArticleScreen /></ProtectedRoute>} />
        <Route path="/breathing"   element={<BreathingScreen />} />
        <Route path="/analytics"   element={<ProtectedRoute><AnalyticsScreen /></ProtectedRoute>} />
        <Route path="/profile"     element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />

        {/* Peer support */}
        <Route path="/peer"              element={<ProtectedRoute><PeerRequestScreen /></ProtectedRoute>} />
        <Route path="/peer/waiting/:id"  element={<ProtectedRoute><PeerWaitingScreen /></ProtectedRoute>} />
        <Route path="/peer/session/:id/text"  element={<ProtectedRoute><PeerTextChatScreen /></ProtectedRoute>} />
        <Route path="/peer/session/:id/voice" element={<ProtectedRoute><PeerVoiceCallScreen /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {!hideNav && <BottomNav />}
      {token && <EmergencyButton />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}
