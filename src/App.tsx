import { useMemo, useState } from 'react';
import { LayoutDashboard, ListChecks, LogOut, Search, User as UserIcon } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedLayout } from './components/layout/ProtectedLayout';
import type { NavTab } from './components/layout/BottomNavigation';
import { Login } from './pages/Login';
import { ControlTower } from './components/dashboard/ControlTower';
import { FastChecklist } from './components/checklist/FastChecklist';
import { OrderSpecsForm } from './components/orders/OrderSpecsForm';
import { OrderCardTouch } from './components/orders/OrderCardTouch';
import { OrderDetailSheet } from './components/orders/OrderDetailSheet';
import { ClientTrackingCard } from './components/orders/ClientTrackingCard';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { useOrders } from './hooks/useOrders';
import { mockDataService } from './services/mockDataService';
import { formatUF } from './utils/formatters';
import type { WorkOrder } from './types/order';

type Tab = 'home' | 'checklist' | 'search' | 'profile';

const ROLE_LABEL: Record<string, string> = { ADMIN: 'Administrador', OPERATOR: 'Taller/Oficina', CLIENT: 'Cliente' };
const TAB_TITLE: Record<Tab, string> = { home: 'ForgeFlow', checklist: 'Checklist Rápido', search: 'Buscar OTs', profile: 'Perfil' };

function ClientHomeView() {
  const { user } = useAuth();
  const { getClientProfile } = useOrders();
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
          <p className="text-lg font-bold text-forge-accent">{formatUF(profile.totalAmountUF)}</p>
          <p className="text-xs text-forge-steel">{profile.activeCount} en curso · {profile.completedCount} entregadas</p>
        </div>
      </Card>

      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-forge-steel">En curso ({active.length})</h2>
        <div className="space-y-3">
          {active.length === 0 && <p className="py-6 text-center text-sm text-forge-steel">No tienes OTs en producción por ahora.</p>}
          {active.map((order) => <ClientTrackingCard key={order.id} order={order} />)}
        </div>
      </div>

      {completed.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-forge-steel">Entregadas ({completed.length})</h2>
          <div className="space-y-3">
            {completed.map((order) => <ClientTrackingCard key={order.id} order={order} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function HomeView() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const [selected, setSelected] = useState<WorkOrder | null>(null);

  if (user?.role === 'ADMIN') return <ControlTower />;
  if (user?.role === 'CLIENT') return <ClientHomeView />;

  // OPERATOR
  const active = orders.filter((o) => o.status !== 'COMPLETADO');
  return (
    <div className="space-y-5 pb-24">
      <OrderSpecsForm />
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-forge-steel">OTs activas ({active.length})</h2>
        <div className="space-y-2.5">
          {active.slice(0, 6).map((order) => <OrderCardTouch key={order.id} order={order} onOpen={setSelected} />)}
        </div>
      </div>
      <OrderDetailSheet order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function SearchView() {
  const [query, setQuery] = useState('');
  const { orders } = useOrders({ search: query });
  const [selected, setSelected] = useState<WorkOrder | null>(null);

  return (
    <div className="space-y-4 pb-24">
      <Input label="Buscar por OT, proyecto o cliente" placeholder="Ej: OT-1049, Silo, Andes…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="space-y-2.5">
        {orders.map((order) => <OrderCardTouch key={order.id} order={order} onOpen={setSelected} />)}
        {query && orders.length === 0 && <p className="py-8 text-center text-sm text-forge-steel">Sin resultados para "{query}".</p>}
      </div>
      <OrderDetailSheet order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ProfileView() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-4 pb-24">
      <Card className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-forge-accent/15 text-lg font-bold text-forge-accent">
          {user.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-forge-steel">{user.email}</p>
          <p className="text-xs text-forge-accent">{ROLE_LABEL[user.role] ?? user.role}</p>
        </div>
      </Card>

      {user.role === 'ADMIN' && (
        <Card>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-forge-steel">Usuarios del sistema</h3>
          <ul className="divide-y divide-forge-border/60">
            {mockDataService.getUsers().map((u) => (
              <li key={u.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-forge-steel">{u.email}</p>
                </div>
                <span className={`text-xs ${u.active ? 'text-forge-ok' : 'text-forge-steel'}`}>
                  {ROLE_LABEL[u.role] ?? u.role}{!u.active && ' · inactivo'}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Button variant="danger" fullWidth size="lg" icon={<LogOut className="size-4" />} onClick={logout}>
        Cerrar sesión
      </Button>
    </div>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('home');

  const tabs = useMemo<NavTab<Tab>[]>(() => {
    if (user?.role === 'CLIENT') {
      return [
        { id: 'home', label: 'Mis OTs', icon: LayoutDashboard },
        { id: 'profile', label: 'Perfil', icon: UserIcon },
      ];
    }
    return [
      { id: 'home', label: user?.role === 'ADMIN' ? 'Torre Control' : 'Dashboard', icon: LayoutDashboard },
      { id: 'checklist', label: 'Checklist', icon: ListChecks },
      { id: 'search', label: 'Buscar', icon: Search },
      { id: 'profile', label: 'Perfil', icon: UserIcon },
    ];
  }, [user]);

  const activeTab = tabs.some((t) => t.id === tab) ? tab : 'home';

  return (
    <ProtectedLayout tabs={tabs} active={activeTab} onChange={setTab} title={TAB_TITLE[activeTab]}>
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'checklist' && <FastChecklist />}
      {activeTab === 'search' && <SearchView />}
      {activeTab === 'profile' && <ProfileView />}
    </ProtectedLayout>
  );
}

function Gate() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <OrderProvider>
      <AuthenticatedApp />
    </OrderProvider>
  ) : (
    <Login />
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Gate />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
