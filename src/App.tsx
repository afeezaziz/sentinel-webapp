import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import ErrorBoundary from './components/ui/error/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import AppShell from './components/layout/AppShell'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RiskList from './pages/RiskList'
import RiskDetail from './pages/RiskDetail'
import Assets from './pages/Assets'
import AssetDetail from './pages/AssetDetail'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminRiskList from './pages/admin/RiskList'
import AdminAssetList from './pages/admin/AssetList'
import AdminAnalytics from './pages/admin/Analytics'
import Organizations from './pages/admin/Organizations'
import OrganizationDetail from './pages/admin/OrganizationDetail'
import Users from './pages/admin/Users'
import UserDetail from './pages/admin/UserDetail'
import AuditLog from './pages/admin/AuditLog'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Dashboard />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/risks"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <RiskList />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/risk/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <RiskDetail />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assets"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Assets />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/asset/:id"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <AssetDetail />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Analytics />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            {/* Admin Routes - Only accessible by admin users */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppShell>
                    <AdminDashboard />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/risks"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppShell>
                    <AdminRiskList />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assets"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppShell>
                    <AdminAssetList />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppShell>
                    <AdminAnalytics />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/organizations"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppShell>
                    <Organizations />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/organizations/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppShell>
                    <OrganizationDetail />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppShell>
                    <Users />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppShell>
                    <UserDetail />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-log"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AppShell>
                    <AuditLog />
                  </AppShell>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
