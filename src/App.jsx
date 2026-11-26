import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { reducer, createInitialState } from './context/appointmentReducer.js';
import { usePersistentReducer } from './hooks/usePersistentReducer.js';
import { AppointmentContext } from './context/AppointmentContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import AppSidebar from './components/AppSidebar.jsx';
import AppHeader from './components/AppHeader.jsx';
import GlobalOverlays from './components/GlobalOverlays.jsx';

  function getInitialUser() {
    try {
      const raw = window.sessionStorage.getItem('clinicdesk.auth');
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (parsed && (parsed.role === 'receptionist' || parsed.role === 'doctor')) {
        return parsed;
      }
    } catch {
      return null;
    }

    return null;
  }

  function App() {
    const [state, dispatch] = usePersistentReducer(
      reducer,
      createInitialState,
      'clinicdesk.appointments',
    );
    const [user, setUser] = useState(getInitialUser);
    const [darkMode, setDarkMode] = useState(
      () => window.localStorage.getItem('clinicdesk.dark') === 'true',
    );
    const [clock, setClock] = useState(new Date());
    const [toast, setToast] = useState('');
    const [confirmRequest, setConfirmRequest] = useState(null);
    const toastTimerRef = useRef(null);

    const role = user?.role || 'receptionist';
    const doctorId = user?.doctorId || 1;

    useEffect(() => {
      window.localStorage.setItem(
        'clinicdesk.settings',
        JSON.stringify(state.settings),
      );
    }, [state.settings]);

    useEffect(() => {
    if (user) {
      window.sessionStorage.setItem('clinicdesk.auth', JSON.stringify(user));
      window.sessionStorage.setItem('clinicdesk.role', user.role);
      window.sessionStorage.setItem(
        'clinicdesk.doctorId',
        String(user.doctorId || 1),
      );
    } else {
      window.sessionStorage.removeItem('clinicdesk.auth');
      window.sessionStorage.removeItem('clinicdesk.role');
      window.sessionStorage.removeItem('clinicdesk.doctorId');
    }
  }, [user]);

  useEffect(() => {
    window.localStorage.setItem('clinicdesk.dark', String(darkMode));
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  useEffect(() => {
    const clockInterval = window.setInterval(() => {
      setClock(new Date());
    }, 1000);

    return () => window.clearInterval(clockInterval);
  }, []);

  useEffect(() => () => {
    window.clearTimeout(toastTimerRef.current);
  }, []);

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(''), 2600);
  }, []);

  const askConfirm = useCallback((message, onConfirm) => {
    setConfirmRequest({ message, onConfirm });
  }, []);

  const handleLogin = useCallback((authenticatedUser) => {
    setUser(authenticatedUser);
    notify(`Signed in as ${authenticatedUser.name}.`);
  }, [notify]);

  const handleLogout = useCallback(() => {
    window.sessionStorage.removeItem('clinicdesk.filters');
    window.sessionStorage.removeItem('clinicdesk.page');
    setUser(null);
    notify('Signed out.');
  }, [notify]);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      user,
      role,
      doctorId,
      notify,
      askConfirm,
    }),
    [state, dispatch, user, role, doctorId, notify, askConfirm],
  );

  const dismissConfirmation = useCallback(() => {
    setConfirmRequest(null);
  }, []);

  return (
    <AppointmentContext.Provider value={contextValue}>
        {user ? (
          <div className="app-shell">
            <AppSidebar clinicName={state.settings.clinicName} role={role} />

              <main className="main">
                <AppHeader
                  clock={clock}
                  clinicName={state.settings.clinicName}
                  user={user}
                  darkMode={darkMode}
                  onDarkModeChange={() => setDarkMode((current) => !current)}
                  onLogout={handleLogout}
                />

              <AppRoutes
                user={user}
                clinicName={state.settings.clinicName}
                darkMode={darkMode}
                onDarkModeChange={() => setDarkMode((current) => !current)}
                onLogin={handleLogin}
              />
            </main>
          </div>
        ) : (
          <AppRoutes
            user={null}
            clinicName={state.settings.clinicName}
            darkMode={darkMode}
            onDarkModeChange={() => setDarkMode((current) => !current)}
            onLogin={handleLogin}
          />
        )}

      <GlobalOverlays
        toast={toast}
        confirmRequest={confirmRequest}
        onDismissConfirm={dismissConfirmation}
      />
    </AppointmentContext.Provider>
  );
}

export default App;
