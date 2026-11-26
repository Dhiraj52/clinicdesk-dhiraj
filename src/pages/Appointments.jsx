import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DOCTORS,
  STATUS,
  dateLabel,
  timeLabel,
  csvCell,
  getDoctorName,
  getDisplayStatus,
} from '../utils.js';
import { useStore } from '../hooks/useStore.js';
import { useAppointmentList } from '../hooks/useAppointmentList.js';
import { APPOINTMENTS_PER_PAGE } from '../utils/constants.js';
import {
  PageTitle,
  StatusBadge,
  Empty,
  Modal,
} from '../components/ui.jsx';


function AppointmentFilters({ filters, onChange, role, doctorId, onExport, onPrint }) {
  const visibleDoctors = DOCTORS.filter((doctor) => (
    role !== 'doctor' || doctor.id === doctorId
  ));

  return (
    <div className="filters">
      <input
        aria-label="Search patients"
        placeholder="Search patient or phone…"
        value={filters.search}
        onChange={(event) => onChange('search', event.target.value)}
      />

      <select
        aria-label="Filter doctor"
        value={role === 'doctor' ? String(doctorId) : filters.doctor}
        disabled={role === 'doctor'}
        onChange={(event) => onChange('doctor', event.target.value)}
      >
        {role !== 'doctor' && <option value="all">All doctors</option>}
        {visibleDoctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter status"
        value={filters.status}
        onChange={(event) => onChange('status', event.target.value)}
      >
        <option value="all">All statuses</option>
        {Object.entries(STATUS).map(([key, status]) => (
          <option key={key} value={key}>{status.label}</option>
        ))}
      </select>

      <input
        aria-label="From date"
        type="date"
        value={filters.from}
        onChange={(event) => onChange('from', event.target.value)}
      />

      <input
        aria-label="To date"
        type="date"
        min={filters.from || undefined}
        value={filters.to}
        onChange={(event) => onChange('to', event.target.value)}
      />

      <select
        aria-label="Sort appointments"
        value={filters.sort}
        onChange={(event) => onChange('sort', event.target.value)}
      >
        <option value="date-asc">Date: earliest first</option>
        <option value="date-desc">Date: latest first</option>
        <option value="name">Patient name A–Z</option>
        <option value="name-desc">Patient name Z–A</option>
      </select>

      <button className="secondary" onClick={onExport}>⇩ CSV</button>
      <button className="secondary" onClick={onPrint}>Print</button>
    </div>
  );
}

function AppointmentActions({ appointment, role, onHistory, onEdit, onCancel }) {
  return (
    <div className="table-actions">
      <button
        type="button"
        className="action-btn action-neutral"
        onClick={() => onHistory(appointment)}
      >
        History
      </button>

      {role === 'receptionist' && (
        <button
          type="button"
          className="action-btn action-primary"
          onClick={() => onEdit(appointment)}
          disabled={appointment.status === 'cancelled'}
        >
          Edit
        </button>
      )}

      {role === 'receptionist'
        && !['cancelled', 'completed'].includes(appointment.status) && (
        <button
          type="button"
          className="action-btn action-danger"
          onClick={() => onCancel(appointment)}
        >
          Cancel
        </button>
      )}
    </div>
  );
}

function AppointmentTable({ appointments, role, onHistory, onEdit, onCancel }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Age</th>
            <th>Doctor</th>
            <th>Date & time</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>
                <div className="table-patient">
                  <strong>{appointment.patientName}</strong>
                  <small>{appointment.phone}</small>
                </div>
              </td>
              <td>{appointment.age ?? '—'}</td>
              <td>{getDoctorName(appointment.doctorId)}</td>
              <td>
                {dateLabel(appointment.date)}
                <small className="table-sub">{timeLabel(appointment.time)}</small>
              </td>
              <td className="reason-cell">{appointment.reason}</td>
              <td><StatusBadge status={getDisplayStatus(appointment)} /></td>
              <td>
                <AppointmentActions
                  appointment={appointment}
                  role={role}
                  onHistory={onHistory}
                  onEdit={onEdit}
                  onCancel={onCancel}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AppointmentCards({ appointments, role, onHistory, onEdit, onCancel }) {
  return (
    <div className="appointment-cards">
      {appointments.map((appointment) => (
        <article className="appointment-card" key={appointment.id}>
          <div className="card-top">
            <strong>{appointment.patientName}</strong>
            <StatusBadge status={getDisplayStatus(appointment)} />
          </div>
          <p>{appointment.phone} · Age {appointment.age ?? '—'}</p>
          <p>{getDoctorName(appointment.doctorId)}</p>
          <p>{dateLabel(appointment.date)} · {timeLabel(appointment.time)}</p>
          <p>{appointment.reason}</p>
          <AppointmentActions
            appointment={appointment}
            role={role}
            onHistory={onHistory}
            onEdit={onEdit}
            onCancel={onCancel}
          />
        </article>
      ))}
    </div>
  );
}

function AppointmentHistory({ appointment, onClose }) {
  const history = [...(appointment.history || [])].reverse();

  return (
    <Modal
      title={`Appointment history · ${appointment.patientName}`}
      onClose={onClose}
    >
      {history.length === 0 ? (
        <p className="muted">No history has been recorded for this appointment yet.</p>
      ) : (
        <div className="history-list">
          {history.map((entry, index) => (
            <div key={`${entry.at}-${index}`}>
              <span className="history-dot" />
              <div>
                <strong>{entry.event}</strong>
                <small>{new Date(entry.at).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function AppointmentPagination({ page, pageCount, total, onPageChange }) {
  const firstRecord = total === 0 ? 0 : ((page - 1) * APPOINTMENTS_PER_PAGE) + 1;
  const lastRecord = Math.min(page * APPOINTMENTS_PER_PAGE, total);

  return (
    <div className="pagination">
      <span>{total ? `${firstRecord}–${lastRecord} of ${total}` : '0 results'}</span>
      <div>
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Previous
        </button>
        <span>Page {page} / {pageCount}</span>
        <button
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function AppointmentListPage() {
  const {
    state,
    dispatch,
    role,
    doctorId,
    notify,
    askConfirm,
  } = useStore();
  const navigate = useNavigate();
  const [historyAppointment, setHistoryAppointment] = useState(null);
  const {
    filters,
    updateFilter,
    page,
    setPage,
    pageCount,
    filteredAppointments,
    visibleAppointments,
  } = useAppointmentList(state.appointments, role, doctorId);

  function exportCSV() {
    const headings = [
      'Patient',
      'Phone',
      'Age',
      'Doctor',
      'Date',
      'Time',
      'Reason',
      'Status',
    ];
    const rows = filteredAppointments.map((appointment) => ([
      appointment.patientName,
      appointment.phone,
      appointment.age,
      getDoctorName(appointment.doctorId),
      appointment.date,
      appointment.time,
      appointment.reason,
      STATUS[appointment.status]?.label,
    ]));
    const csvContent = [headings, ...rows]
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n');
    const file = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const fileUrl = URL.createObjectURL(file);
    const downloadLink = document.createElement('a');

    downloadLink.href = fileUrl;
    downloadLink.download = 'clinicdesk-appointments.csv';
    downloadLink.click();
    URL.revokeObjectURL(fileUrl);
    notify('CSV export prepared.');
  }

  function cancelAppointment(appointment) {
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

  function openEditPage(appointment) {
    if (role !== 'receptionist') {
      notify('Only the receptionist can edit appointments.');
      return;
    }

    navigate(`/appointments/${appointment.id}/edit`);
  }

  return (
    <>
      <PageTitle
        eyebrow="PATIENT SCHEDULE"
        title="Appointments"
        subtitle="Search, filter, and manage clinic appointments."
        action={role === 'receptionist' ? (
          <button
            className="primary"
            onClick={() => navigate('/appointments/new')}
          >
            ＋ New appointment
          </button>
        ) : null}
      />

      <section className="panel">
        <AppointmentFilters
          filters={filters}
          role={role}
          doctorId={doctorId}
          onChange={updateFilter}
          onExport={exportCSV}
          onPrint={() => window.print()}
        />

        <AppointmentTable
          appointments={visibleAppointments}
          role={role}
          onHistory={setHistoryAppointment}
          onEdit={openEditPage}
          onCancel={cancelAppointment}
        />

        <AppointmentCards
          appointments={visibleAppointments}
          role={role}
          onHistory={setHistoryAppointment}
          onEdit={openEditPage}
          onCancel={cancelAppointment}
        />

        {visibleAppointments.length === 0 && (
          <Empty
            title="No appointments found"
            text="Try changing your search or filters."
          />
        )}

        <AppointmentPagination
          page={page}
          pageCount={pageCount}
          total={filteredAppointments.length}
          onPageChange={setPage}
        />
      </section>

      {historyAppointment && (
        <AppointmentHistory
          appointment={historyAppointment}
          onClose={() => setHistoryAppointment(null)}
        />
      )}
    </>
  );
}
export default AppointmentListPage;
