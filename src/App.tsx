import { useMemo, useState } from 'react';
import { LayoutDashboard, ListChecks, LogOut, Pencil, RotateCcw, Search, Truck, User as UserIcon } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import { UiPrefsProvider, useUiPrefs } from './contexts/UiPrefsContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedLayout } from './components/layout/ProtectedLayout';
import type { NavTab } from './components/layout/BottomNavigation';
import { Login } from './pages/Login';
import { ControlTower } from './components/dashboard/ControlTower';
import { FastChecklist } from './components/checklist/FastChecklist';
import { OrderCardTouch } from './components/orders/OrderCardTouch';
import { OrderDetailSheet } from './components/orders/OrderDetailSheet';
import { ClientMacroStatusCard } from './components/orders/ClientMacroStatusCard';
import { DispatchCard } from './components/orders/DispatchCard';
import { SalesRequestForm } from './components/orders/SalesRequestForm';
import { SalesRequestList } from './components/orders/SalesRequestList';
import { EditProfileSheet } from './components/profile/EditProfileSheet';
import { WorkerManagement } from './components/profile/WorkerManagement';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { useOrders } from './hooks/useOrders';
import { storageService } from './services/storageService';
import { formatRole, formatUF } from './utils/formatters';

type Tab = 'home' | 'checklist' | 'search' | 'dispatch' | 'profile';

function ClientHomeView() {
  const { user } = useAuth();
  const { getClientProfile } = useOrders();
  const { t, language } = useUiPrefs();
  if (!user?.clientName) return null;

  const profile = getClientProfile(user.clientName);
  const active = profile.orders.filter((o) => o.status !== 'COMPLETADO');
  const completed = profile.orders.filter((o) => o.status === 'COMPLETADO');

  return (
    <div className="space-y-5 pb-24">
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{profile.clientName}</p>
          <p className="text-xs text-forge-steel">{profile.clientRut}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-forge-accent">{formatUF(profile.totalAmountUF, language)}</p>
          <p className="text-xs text-forge-steel">
            {t.app.clientHome.activeCount(profile.activeCount)} · {t.app.clientHome.completedCount(profile.completedCount)}
          </p>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-forge-steel">{t.app.clientHome.contactTitle}</p>
        {profile.primaryVendedor ? (
          <>
            <p className="mt-1 text-sm font-semibold text-slate-100">{profile.primaryVendedor}</p>
            <p className="mt-0.5 text-xs text-forge-steel">{t.app.clientHome.contactHint}</p>
          </>
        ) : (
          <p className="mt-1 text-sm text-forge-steel">{t.app.clientHome.noContact}</p>
        )}
      </Card>

      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-forge-steel">
          {t.app.clientHome.activeSectionTitle(active.length)}
        </h2>
        <div className="space-y-3">
          {active.length === 0 && <p className="py-6 text-center text-sm text-forge-steel">{t.app.clientHome.noActive}</p>}
          {active.map((order) => <ClientMacroStatusCard key={order.id} order={order} />)}
        </div>
      </div>

      {completed.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-forge-steel">
            {t.app.clientHome.completedSectionTitle(completed.length)}
          </h2>
          <div className="space-y-3">
            {completed.map((order) => <ClientMacroStatusCard key={order.id} order={order} />)}
          </div>
        </div>
      )}
    </div>
  );
}

/** "Mis Despachos y Entregas": OTs del cliente que ya llegaron a Despacho o fueron entregadas. */
function ClientDispatchView() {
  const { allOrders } = useOrders();
  const { t } = useUiPrefs();
  const dispatches = allOrders.filter((o) => o.currentStation === 'DESPACHO' || o.status === 'COMPLETADO');

  return (
    <div className="space-y-3 pb-24">
      {dispatches.length === 0 ? (
        <p className="py-10 text-center text-sm text-forge-steel">{t.app.dispatchView.empty}</p>
      ) : (
        dispatches.map((order) => <DispatchCard key={order.id} order={order} />)
      )}
    </div>
  );
}

function VendedorHomeView() {
  const { user } = useAuth();
  const { salesRequests } = useOrders();
  if (!user) return null;
  const mine = salesRequests.filter((r) => r.requestedBy === user.name);

  return (
    <div className="space-y-5 pb-24">
      <SalesRequestForm />
      <SalesRequestList requests={mine} />
    </div>
  );
}

function HomeView() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const { t } = useUiPrefs();
  // Se guarda solo el ID y se busca la OT viva en cada render — si no, el sheet
  // queda mostrando una foto congelada y una nota agregada sin cerrarlo no se ve.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = orders.find((o) => o.id === selectedId) ?? null;

  if (user?.role === 'ADMIN') return <ControlTower />;
  if (user?.role === 'CLIENT') return <ClientHomeView />;
  if (user?.role === 'VENDEDOR') return <VendedorHomeView />;

  // OPERATOR
  const active = orders.filter((o) => o.status !== 'COMPLETADO');
  return (
    <div className="space-y-5 pb-24">
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-forge-steel">
          {t.app.homeOperator.activeSectionTitle(active.length)}
        </h2>
        <div className="space-y-2.5">
          {active.slice(0, 6).map((order) => <OrderCardTouch key={order.id} order={order} onOpen={(o) => setSelectedId(o.id)} />)}
        </div>
      </div>
      <OrderDetailSheet order={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}

function SearchView() {
  const [query, setQuery] = useState('');
  const { orders, allOrders } = useOrders({ search: query });
  const { t } = useUiPrefs();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Deriva desde `allOrders` (sin filtro de búsqueda) para que el sheet no se
  // cierre solo si el texto de búsqueda cambia mientras está abierto.
  const selected = allOrders.find((o) => o.id === selectedId) ?? null;

  return (
    <div className="space-y-4 pb-24">
      <Input label={t.app.searchView.label} placeholder={t.app.searchView.placeholder} value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="space-y-2.5">
        {orders.map((order) => <OrderCardTouch key={order.id} order={order} onOpen={(o) => setSelectedId(o.id)} />)}
        {query && orders.length === 0 && <p className="py-8 text-center text-sm text-forge-steel">{t.app.searchView.noResults(query)}</p>}
      </div>
      <OrderDetailSheet order={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}

function ProfileView() {
  const { user, logout } = useAuth();
  const { t, language } = useUiPrefs();
  const [editOpen, setEditOpen] = useState(false);
  if (!user) return null;

  return (
    <div className="space-y-4 pb-24">
      <Card className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-forge-accent/15 text-lg font-bold text-forge-accent">
          {user.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-forge-steel">{user.email}</p>
          <p className="text-xs text-forge-accent">{formatRole(user.role, language)}</p>
        </div>
        <Button variant="ghost" size="sm" icon={<Pencil className="size-3.5" />} onClick={() => setEditOpen(true)}>
          {t.profile.workerManagement.edit}
        </Button>
      </Card>

      {user.role === 'ADMIN' && <WorkerManagement />}

      <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} />

      <Button
        variant="outline"
        fullWidth
        size="md"
        icon={<RotateCcw className="size-4" />}
        onClick={() => {
          storageService.clearAll();
          window.location.reload();
        }}
      >
        {t.app.profileView.resetDemo}
      </Button>

      <Button variant="danger" fullWidth size="lg" icon={<LogOut className="size-4" />} onClick={logout}>
        {t.app.profileView.logout}
      </Button>
    </div>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();
  const { t } = useUiPrefs();
  const [tab, setTab] = useState<Tab>('home');

  const tabs = useMemo<NavTab<Tab>[]>(() => {
    if (user?.role === 'CLIENT') {
      return [
        { id: 'home', label: t.app.navLabels.myOrders, icon: LayoutDashboard },
        { id: 'dispatch', label: t.app.navLabels.dispatches, icon: Truck },
        { id: 'profile', label: t.app.navLabels.profile, icon: UserIcon },
      ];
    }
    return [
      { id: 'home', label: user?.role === 'ADMIN' ? t.app.navLabels.controlTower : t.app.navLabels.dashboard, icon: LayoutDashboard },
      { id: 'checklist', label: t.app.navLabels.checklist, icon: ListChecks },
      { id: 'search', label: t.app.navLabels.search, icon: Search },
      { id: 'profile', label: t.app.navLabels.profile, icon: UserIcon },
    ];
  }, [user, t]);

  const activeTab = tabs.some((tb) => tb.id === tab) ? tab : 'home';

  const tabTitle: Record<Tab, string> = {
    home: t.app.tabTitle.home,
    checklist: t.app.tabTitle.checklist,
    search: t.app.tabTitle.search,
    dispatch: t.app.tabTitle.dispatch,
    profile: t.app.tabTitle.profile,
  };

  return (
    <ProtectedLayout tabs={tabs} active={activeTab} onChange={setTab} title={tabTitle[activeTab]}>
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'checklist' && <FastChecklist />}
      {activeTab === 'search' && <SearchView />}
      {activeTab === 'dispatch' && <ClientDispatchView />}
      {activeTab === 'profile' && <ProfileView />}
    </ProtectedLayout>
  );
}

function Gate() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AuthenticatedApp /> : <Login />;
}

function App() {
  return (
    <UiPrefsProvider>
      <AuthProvider>
        {/* OrderProvider vive fuera del gate de auth: así el estado (y su listener
            cross-tab) no se remonta en cada login/logout, y cambiar de perfil siempre
            ve los datos más recientes sin depender de un refetch al iniciar sesión. */}
        <OrderProvider>
          <ToastProvider>
            <Gate />
          </ToastProvider>
        </OrderProvider>
      </AuthProvider>
    </UiPrefsProvider>
  );
}

export default App;
