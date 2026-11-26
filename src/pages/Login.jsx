import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AUTH_ACCOUNTS, authenticateUser } from '../utils/auth.js';
import { Field } from '../components/ui.jsx';

function LoginPage({ user, clinicName, darkMode, onDarkModeChange, onLogin }) {
  const navigate = useNavigate();
  const [role, setRole] = useState('receptionist');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) {
    return (
      <Navigate
        to={user.role === 'doctor' ? '/appointments' : '/'}
        replace
      />
    );
  }

  function handleRoleChange(nextRole) {
    setRole(nextRole);
    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    const authenticated = authenticateUser({ role, email, password });

    if (!authenticated) {
      setError('Invalid credentials. Please verify your role, email, and password.');
      return;
    }

    onLogin(authenticated);
    navigate(authenticated.role === 'doctor' ? '/appointments' : '/', {
      replace: true,
    });
  }

  return (
    <div className="auth-shell">
      <div className="auth-topbar">
        <div className="auth-brand">
          <span className="brand-mark">✚</span>
          <div>
            <strong>ClinicDesk</strong>
            <small>{clinicName}</small>
          </div>
        </div>

        <button
          type="button"
          className="icon-btn"
          onClick={onDarkModeChange}
          title="Toggle dark mode"
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀' : '☾'}
        </button>
      </div>

      <section className="panel auth-card" aria-labelledby="login-heading">
        <div className="auth-header">
          <span className="eyebrow">STAFF SIGN IN</span>
          <h1 id="login-heading">Welcome back</h1>
          <p className="muted">
            Sign in with your clinic account to access your workspace.
          </p>
        </div>

        <div className="role-toggle" role="group" aria-label="Select role">
          <button
            type="button"
            className={role === 'receptionist' ? 'active' : ''}
            aria-pressed={role === 'receptionist'}
            onClick={() => handleRoleChange('receptionist')}
          >
            Receptionist
          </button>
          <button
            type="button"
            className={role === 'doctor' ? 'active' : ''}
            aria-pressed={role === 'doctor'}
            onClick={() => handleRoleChange('doctor')}
          >
            Doctor
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Field label="Email">
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError('');
              }}
              placeholder={
                role === 'doctor'
                  ? 'e.g. priya@clinicdesk.in'
                  : 'e.g. meera@clinicdesk.in'
              }
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your password"
            />
          </Field>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="primary auth-submit">
            Sign in as {role === 'doctor' ? 'Doctor' : 'Receptionist'}
          </button>
        </form>

        <details className="auth-demo">
          <summary>Staff directory (demo credentials)</summary>
          <ul>
            {AUTH_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <strong>{account.name}</strong> ({account.role}):{' '}
                <code>{account.email}</code> / <code>{account.password}</code>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  );
}

export default LoginPage;
