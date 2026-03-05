import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PregnancyPage } from './pages/PregnancyPage';
import { ConsultationsPage } from './pages/ConsultationsPage';
import { UltrasoundsPage } from './pages/UltrasoundsPage';
import { DeliveriesPage } from './pages/DeliveriesPage';
import { PostPartumPage } from './pages/PostPartumPage';
import { NewbornsPage } from './pages/NewbornsPage';
import { AlertsPage } from './pages/AlertsPage';
import { AuditPage } from './pages/AuditPage';

export function App() {
  return (
    <ThemeProvider storageKey="maternacare-theme">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="pregnancies" element={<PregnancyPage />} />
              <Route path="consultations" element={<ConsultationsPage />} />
              <Route path="ultrasounds" element={<UltrasoundsPage />} />
              <Route path="deliveries" element={<DeliveriesPage />} />
              <Route path="postpartum" element={<PostPartumPage />} />
              <Route path="newborns" element={<NewbornsPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="audit" element={<AuditPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
