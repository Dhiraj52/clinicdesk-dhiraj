import { NavLink } from 'react-router-dom';

function AppSidebar({ clinicName, role }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">✚</span>
        <div>
          <strong>ClinicDesk</strong>
          <small>{clinicName}</small>
        </div>
      </div>

      <nav aria-label="Main navigation">
        <NavLink to="/" end>
          ▦ <span>Overview</span>
        </NavLink>
        <NavLink to="/appointments">
          ▤ <span>Appointments</span>
        </NavLink>
        <NavLink to="/summary">
          ▥ <span>Day summary</span>
        </NavLink>
        {role === 'receptionist' && (
          <NavLink to="/settings">
            ⚙ <span>Settings</span>
          </NavLink>
        )}
      </nav>

      <div className="side-foot">
        <span className="online-dot" /> All systems operational
      </div>
    </aside>
  );
}

export default AppSidebar;
