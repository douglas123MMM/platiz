import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { CrownIcon } from './components/Logo';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import DashboardHome from './pages/DashboardHome';
import Login from './pages/Login';
import Register from './pages/Register';
import SectionPage from './pages/SectionPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';
import SupportChat from './pages/SupportChat';
import ChatPage from './pages/ChatPage';
import PlayerPage from './pages/PlayerPage';
import AdminDashboard from './pages/admin/Dashboard';
import UsersAdmin from './pages/admin/UsersAdmin';
import ContentAdmin from './pages/admin/ContentAdmin';
import BannersAdmin from './pages/admin/BannersAdmin';
import AIAdmin from './pages/admin/AIAdmin';
import StreamsAdmin from './pages/admin/StreamsAdmin';
import AdminSearch from './pages/admin/AdminSearch';
import PartnersAdmin from './pages/admin/PartnersAdmin';
import ContactSettings from './pages/admin/ContactSettings';
import AffiliateDashboard from './pages/AffiliateDashboard';
import AffiliateLanding from './pages/AffiliateLanding';
import AffiliateCatalog from './pages/AffiliateCatalog';
import AffiliatesAdmin from './pages/admin/AffiliatesAdmin';
import MembershipsAdmin from './pages/admin/MembershipsAdmin';
import StoreAdmin from './pages/admin/StoreAdmin';
import TransactionsAdmin from './pages/admin/TransactionsAdmin';
import Entertainment from './pages/Entertainment';
import Store from './pages/Store';
import Recharge from './pages/Recharge';
import Purchases from './pages/Purchases';
import RechargesAdmin from './pages/admin/RechargesAdmin';
import PurchasesAdmin from './pages/admin/PurchasesAdmin';
import LandingConfigAdmin from './pages/admin/LandingConfigAdmin';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <CrownIcon size={64} className="animate-pulse" />
        <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
      </div>
    </div>
  );
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/catalogo/:code" element={<AffiliateCatalog />} />
      <Route path="/producto/:id" element={<ProductDetailPage />} />
      <Route path="/landing/:code" element={<AffiliateLanding />} />
      <Route path="/presentacion/:code" element={<AffiliateLanding />} />
      <Route path="/franquicia/:code" element={<AffiliateLanding />} />
      <Route path="/vsl/:code" element={<AffiliateLanding />} />
      <Route path="/asesoria/:code" element={<AffiliateLanding />} />
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/movies" element={<Entertainment />} />
        <Route path="/courses" element={<SectionPage />} />
        <Route path="/books" element={<SectionPage />} />
        <Route path="/apps" element={<SectionPage />} />
        <Route path="/academy" element={<SectionPage />} />
        <Route path="/affiliate" element={<SectionPage />} />
        <Route path="/programas" element={<SectionPage />} />
        <Route path="/editables" element={<SectionPage />} />
        <Route path="/plr-pro" element={<SectionPage />} />
        <Route path="/ia" element={<SectionPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/soporte" element={<SupportChat />} />
        <Route path="/afiliado" element={<AffiliateDashboard />} />
        <Route path="/player" element={<PlayerPage />} />
        <Route path="/store" element={<Store />} />
        <Route path="/recharge" element={<Recharge />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/membresias" element={<MembershipsAdmin />} />
      </Route>
      <Route element={<ProtectedRoute requireAdmin><Layout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersAdmin />} />
        <Route path="/admin/content" element={<ContentAdmin />} />
        <Route path="/admin/banners" element={<BannersAdmin />} />
        <Route path="/admin/ai" element={<AIAdmin />} />
        <Route path="/admin/streams" element={<StreamsAdmin />} />
        <Route path="/admin/search" element={<AdminSearch />} />
        <Route path="/admin/partners" element={<PartnersAdmin />} />
        <Route path="/admin/contact" element={<ContactSettings />} />
        <Route path="/admin/affiliates" element={<AffiliatesAdmin />} />
        <Route path="/admin/memberships" element={<MembershipsAdmin />} />
        <Route path="/admin/store" element={<StoreAdmin />} />
        <Route path="/admin/transactions" element={<TransactionsAdmin />} />
        <Route path="/admin/recharges" element={<RechargesAdmin />} />
        <Route path="/admin/purchases" element={<PurchasesAdmin />} />
        <Route path="/admin/landing-config" element={<LandingConfigAdmin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
