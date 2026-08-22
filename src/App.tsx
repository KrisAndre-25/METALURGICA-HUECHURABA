import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import { AppShell } from './components/layout/AppShell';
import { LoginScreen } from './components/layout/LoginScreen';
import type { View } from './components/layout/Sidebar';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { OrdersPage } from './components/orders/OrdersPage';
import { ChecklistPage } from './components/checklist/ChecklistPage';

function AuthenticatedApp() {
  const [view, setView] = useState<View>('dashboard');

  return (
    <OrderProvider>
      <AppShell active={view} onNavigate={setView}>
        {view === 'dashboard' && <DashboardPage />}
        {view === 'orders' && <OrdersPage />}
        {view === 'checklist' && <ChecklistPage />}
      </AppShell>
    </OrderProvider>
  );
}

function Gate() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AuthenticatedApp /> : <LoginScreen />;
}

function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

export default App;
