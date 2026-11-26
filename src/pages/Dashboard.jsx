import { NavLink, useNavigate } from 'react-router-dom';
import {
  STATUS,
  todayISO,
  dateLabel,
  timeLabel,
  isLateAppointment,
  getDoctorName,
} from '../utils.js';
import { useStore } from '../hooks/useStore.js';
import { getAllowedQueueActions } from '../utils/permissions.js';
import { PageTitle, StatusBadge, Empty } from '../components/ui.jsx';
import {
  DashboardStats,
  DashboardSummaryPanels,
} from '../components/dashboard/DashboardSummaryPanels.jsx';

const STATUS_GROUPS = ['booked', 'arrived', 'in_consultation', 'completed'];

function QueueActions({ appointment, role, onStatusChange, onCancel }) {
  const allowedActions = getAllowedQueueActions(role, appointment.status);
  const actionLabels = {
    arrived: 'Mark arrived',
    no_show: 'No-show',
    in_consultation: 'Start visit',
    completed: 'Complete',
  };

  return (
    <div className="row-actions">
      {allowedActions
        .filter((nextStatus) => nextStatus !== 'cancelled')
        .map((nextStatus) => (
          <button
            className="small-btn"
            key={nextStatus}
            onClick={() => onStatusChange(appointment, nextStatus)}
          >
            {actionLabels[nextStatus]}
          </button>
        ))}

      {role === 'receptionist' && allowedActions.includes('cancelled') && (
        <button
          className="small-btn danger-text"
          onClick={() => onCancel(appointment)}
        >
          Cancel
        </button>
      )}
    </div>
  );
}

function QueueAppointment({ appointment, role, onStatusChange, onCancel }) {
  const isLate = isLateAppointment(appointment);
  const patientInitials = appointment.patientName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  return (
    <article className={`queue-row ${isLate ? 'queue-row-late' : ''}`}>
      <div className="time-col">
        <strong>{timeLabel(appointment.time)}</strong>
        <small>{isLate ? 'More than 15 min late' : 'Appointment'}</small>
      </div>

      <div className="patient">
        <span className="avatar">{patientInitials}</span>
        <div>
          <strong>{appointment.patientName}</strong>
          <small>
            {appointment.reason} · {appointment.phone}
          </small>
        </div>
      </div>

      <div className="doctor-name">{getDoctorName(appointment.doctorId)}</div>
      <StatusBadge status={isLate ? 'booked_late' : appointment.status} />

      <QueueActions
        appointment={appointment}
        role={role}
        onStatusChange={onStatusChange}
        onCancel={onCancel}
      />
    </article>
  );
}

function StatusGroup({ status, appointments, role, onStatusChange, onCancel }) {
  const statusInfo = STATUS[status];

  return (
    <section className="status-group">
      <header className="status-group-heading">
        <span className={`status-dot ${statusInfo.color}`} />
        <h4>{statusInfo.label}</h4>
        <strong>{appointments.length}</strong>
      </header>

      {appointments.length === 0 ? (
        <p className="muted status-group-empty">
          No appointments in this stage.
        </p>
      ) : (
        <div className="queue-list">
          {appointments.map((appointment) => (
            <QueueAppointment
              key={appointment.id}
              appointment={appointment}
              role={role}
              onStatusChange={onStatusChange}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function DashboardPage() {
  const { state, dispatch, role, doctorId, notify, askConfirm } = useStore();
  const navigate = useNavigate();
  const today = todayISO();

  const appointments = state.appointments
    .filter(
      (appointment) =>
        appointment.date === today &&
        appointment.status !== 'cancelled' &&
        (role !== 'doctor' || Number(appointment.doctorId) === doctorId),
    )
    .sort((first, second) => first.time.localeCompare(second.time));

  const counts = STATUS_GROUPS.reduce((result, status) => {
    result[status] = appointments.filter(
      (appointment) => appointment.status === status,
    ).length;
    return result;
  }, {});

  const lateCount = appointments.filter((appointment) =>
    isLateAppointment(appointment),
  ).length;

  function handleStatusChange(appointment, nextStatus) {
    const allowedActions = getAllowedQueueActions(role, appointment.status);

    if (!allowedActions.includes(nextStatus)) {
      notify('You do not have permission for this action.');
      return;
    }

    dispatch({
      type: 'UPDATE_APPOINTMENT_STATUS',
      id: appointment.id,
      status: nextStatus,
    });
    notify(`Marked ${STATUS[nextStatus].label.toLowerCase()}.`);
  }

  function handleCancel(appointment) {
    if (role !== 'receptionist') {
      notify('Only the receptionist can cancel appointments.');
      return;
    }

    askConfirm('Cancel this appointment?', () => {
      dispatch({
        type: 'CANCEL_APPOINTMENT',
        id: appointment.id,
      });
      notify('Appointment cancelled.');
    });
  }

  return (
    <>
      <PageTitle
        eyebrow="CLINIC AT A GLANCE"
        title="Overview"
        subtitle={`${dateLabel(today)} · Your clinic at a glance`}
        action={
          role === 'receptionist' ? (
            <button
              className="primary"
              onClick={() => navigate('/appointments/new')}
            >
              ＋ New appointment
            </button>
          ) : null
        }
      />

      <DashboardStats appointments={appointments} counts={counts} />

      <section className="panel">
        <div className="panel-head">
          <div>
            <h3>Today's queue</h3>
            <p>Appointments grouped by their current stage.</p>
          </div>
          <NavLink className="text-link" to="/appointments">
            View all appointments →
          </NavLink>
        </div>

        {lateCount > 0 && (
          <div className="notice" role="status">
            ⚠ {lateCount} booked appointment(s) are more than 15 minutes late.
          </div>
        )}

        {appointments.length === 0 ? (
          <Empty
            title="No appointments for today"
            text="There are no appointments assigned to this view today."
          />
        ) : (
          <div className="status-groups">
            {STATUS_GROUPS.map((status) => (
              <StatusGroup
                key={status}
                status={status}
                appointments={appointments.filter(
                  (appointment) => appointment.status === status,
                )}
                role={role}
                onStatusChange={handleStatusChange}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </section>

      <DashboardSummaryPanels
        appointments={appointments}
        role={role}
        navigate={navigate}
      />
    </>
  );
}

export default DashboardPage;
