import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { canCreateAppointment } from '../utils/permissions.js';

const Login = lazy(() => import('../pages/Login.jsx'));
const Dashboard = lazy(() => import('../pages/Dashboard.jsx'));
const Appointments = lazy(() => import('../pages/Appointments.jsx'));
const AppointmentEditor = lazy(() => import('../pages/AppointmentEditor.jsx'));
const Summary = lazy(() => import('../pages/Summary.jsx'));
const Settings = lazy(() => import('../pages/Settings.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

function PageLoader() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="spinner" />
      Loading page…
    </div>
  );
}

  function AppRoutes({ user, clinicName, darkMode, onDarkModeChange, onLogin }) {
    const isReceptionist = user ? canCreateAppointment(user.role) : false;

    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/login"
            element={
              <Login
                user={user}
                clinicName={clinicName}
                darkMode={darkMode}
                onDarkModeChange={onDarkModeChange}
                onLogin={onLogin}
              />
            }
          />

          {!user ? (
            <Route path="*" element={<Navigate to="/login" replace />} />
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/appointments" element={<Appointments />} />

              <Route
                path="/appointments/new"
                element={
                  isReceptionist
                    ? <AppointmentEditor />
                    : <Navigate to="/appointments" replace />
                }
              />
              <Route
                path="/appointments/:id/edit"
                element={
                  isReceptionist
                    ? <AppointmentEditor />
                    : <Navigate to="/appointments" replace />
                }
              />

              <Route path="/summary" element={<Summary />} />
              <Route
                path="/settings"
                element={
                  isReceptionist
                    ? <Settings />
                    : <Navigate to="/appointments" replace />
                }
              />
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </Routes>
      </Suspense>
    );
  }

  export default AppRoutes;
