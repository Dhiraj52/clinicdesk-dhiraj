import { Stat, StatusBreakdownList } from '../ui.jsx';

export function DashboardStats({ appointments, counts }) {
  return (
    <div className="stats-grid">
      <Stat
        label="Today's appointments"
        value={appointments.length}
        icon="▤"
      />
      <Stat label="Waiting" value={counts.arrived} icon="◷" accent="amber" />
      <Stat
        label="In consultation"
        value={counts.in_consultation}
        icon="＋"
        accent="purple"
      />
      <Stat
        label="Completed"
        value={counts.completed}
        icon="✓"
        accent="green"
      />
    </div>
  );
}

export function DashboardSummaryPanels({ appointments, role, navigate }) {
  return (
    <div className="below-grid">
      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Queue summary</h3>
            <p>Current appointments by stage.</p>
          </div>
        </div>

        <StatusBreakdownList appointments={appointments} />
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Quick actions</h3>
            <p>Common clinic tasks.</p>
          </div>
        </div>

        <div className="quick-actions">
          {role === 'receptionist' && (
            <button onClick={() => navigate('/appointments/new')}>
              ＋ Book appointment
            </button>
          )}
          <button onClick={() => navigate('/appointments')}>
            ⌕ Find a patient
          </button>
          <button onClick={() => navigate('/summary')}>
            ▥ Open daily summary
          </button>
        </div>
      </section>
    </div>
  );
}
