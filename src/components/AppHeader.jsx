function AppHeader({
  clock,
  clinicName,
  user,
  darkMode,
  onDarkModeChange,
  onLogout,
}) {
  const greeting =
    clock.getHours() < 12
      ? 'Morning'
      : clock.getHours() < 17
        ? 'Afternoon'
        : 'Evening';
  const roleLabel = user?.role === 'doctor' ? 'Doctor' : 'Receptionist';

  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">{clinicName}</span>
        <h1>Good {greeting}</h1>
      </div>

      <div className="top-actions">
        <span className="clock">
          {clock.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>

        <button
          type="button"
          className="icon-btn"
          onClick={onDarkModeChange}
          title="Toggle dark mode"
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀' : '☾'}
        </button>

        <span className="staff-label">
          {user?.name} · {roleLabel}
        </span>

        <button type="button" className="secondary" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
