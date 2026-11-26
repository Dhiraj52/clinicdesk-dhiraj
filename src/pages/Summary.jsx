import { useMemo, useState } from 'react';
import { DOCTORS, todayISO, dateLabel } from '../utils.js';
import { useStore } from '../hooks/useStore.js';
import { PageTitle, Stat, StatusBreakdownList } from '../components/ui.jsx';

function calculateSummary(appointments, selectedDate, role, doctorId) {
  const dayAppointments = appointments.filter((appointment) => (
    appointment.date === selectedDate
    && (role !== 'doctor' || Number(appointment.doctorId) === Number(doctorId))
  ));

  const completed = dayAppointments.filter(
    (appointment) => appointment.status === 'completed',
  ).length;
  const cancelled = dayAppointments.filter(
    (appointment) => appointment.status === 'cancelled',
  ).length;
  const noShows = dayAppointments.filter(
    (appointment) => appointment.status === 'no_show',
  ).length;
  const appointmentsForRate = dayAppointments.length - cancelled;
  const noShowRate = appointmentsForRate > 0
    ? Math.round((noShows / appointmentsForRate) * 100)
    : 0;

  const appointmentsByHour = dayAppointments.reduce((totals, appointment) => {
    const hour = appointment.time.slice(0, 2);
    totals[hour] = (totals[hour] || 0) + 1;
    return totals;
  }, {});

  const busiestHour = Object.entries(appointmentsByHour)
    .sort((first, second) => second[1] - first[1])[0];

  const doctorWorkload = DOCTORS
    .filter((doctor) => role !== 'doctor' || doctor.id === Number(doctorId))
    .map((doctor) => {
      const doctorAppointments = dayAppointments.filter(
        (appointment) => Number(appointment.doctorId) === doctor.id,
      );
      const doctorCompleted = doctorAppointments.filter(
        (appointment) => appointment.status === 'completed',
      ).length;

      return {
        doctor,
        total: doctorAppointments.length,
        completed: doctorCompleted,
      };
    });

  return {
    appointments: dayAppointments,
    completed,
    cancelled,
    noShows,
    noShowRate,
    busiestHour,
    doctorWorkload,
  };
}

function DoctorWorkload({ doctors }) {
  const highestCount = Math.max(
    1,
    ...doctors.map((item) => item.total),
  );

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h3>Doctor workload</h3>
          <p>Appointments assigned to each doctor.</p>
        </div>
      </div>

      {doctors.map((item) => {
        const percentage = (item.total / highestCount) * 100;

        return (
          <div className="doctor-bar" key={item.doctor.id}>
            <div>
              <strong>{item.doctor.name}</strong>
              <span>
                {item.total} appointments · {item.completed} completed
              </span>
            </div>
            <div
              className="bar-track"
              role="progressbar"
              aria-label={`${item.doctor.name} appointments`}
              aria-valuemin="0"
              aria-valuemax={highestCount}
              aria-valuenow={item.total}
            >
              <span style={{ width: `${percentage}%` }} />
            </div>
          </div>
        );
      })}
    </section>
  );
}

function StatusBreakdown({ appointments }) {
  return (
    <section className="panel summary-table">
      <div className="panel-head">
        <div>
          <h3>Appointment breakdown</h3>
          <p>Status totals for the selected day.</p>
        </div>
      </div>

      <StatusBreakdownList appointments={appointments} />
    </section>
  );
}

function SummaryPage() {
  const { state, role, doctorId } = useStore();
  const [selectedDate, setSelectedDate] = useState(todayISO());

  // Summary values are derived from context data and are never stored separately.
  const summary = useMemo(
    () => calculateSummary(
      state.appointments,
      selectedDate,
      role,
      doctorId,
    ),
    [state.appointments, selectedDate, role, doctorId],
  );

  const {
    appointments,
    completed,
    cancelled,
    noShows,
    noShowRate,
    busiestHour,
    doctorWorkload,
  } = summary;

  return (
    <>
      <PageTitle
        eyebrow="DAILY REPORT"
        title="Day summary"
        subtitle="A clear snapshot of appointments and clinic activity."
        action={(
          <label className="date-control">
            Report date
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </label>
        )}
      />

      <div className="stats-grid">
        <Stat label="Total appointments" value={appointments.length} icon="▤" />
        <Stat label="Completed" value={completed} icon="✓" accent="green" />
        <Stat label="Cancelled" value={cancelled} icon="×" accent="amber" />
        <Stat label="No-shows" value={noShows} icon="◷" accent="purple" />
        <Stat label="No-show rate" value={`${noShowRate}%`} icon="%" />
        <Stat
          label="Busiest hour"
          value={busiestHour ? `${busiestHour[0]}:00` : '—'}
          icon="◴"
        />
      </div>

      <DoctorWorkload doctors={doctorWorkload} />
      <StatusBreakdown appointments={appointments} />
      <p className="muted">Report date: {dateLabel(selectedDate)}</p>
    </>
  );
}

export default SummaryPage;
