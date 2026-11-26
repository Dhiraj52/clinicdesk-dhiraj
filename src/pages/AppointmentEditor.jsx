import { useEffect, useState } from 'react';
import { useBlocker, useNavigate, useParams } from 'react-router-dom';
import {
  todayISO,
  makeSlots,
  hasSlotConflict,
  validateAppointment,
} from '../utils.js';
import { useStore } from '../hooks/useStore.js';
import { Empty } from '../components/ui.jsx';
import AppointmentEditorForm from '../components/appointment/AppointmentEditorForm.jsx';
import {
  canAccessAppointment,
  canChooseDoctor,
} from '../utils/permissions.js';

function AppointmentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, notify, role, doctorId } = useStore();
  const isEditing = Boolean(id);
  const appointment = state.appointments.find((item) => item.id === id);
  const hasAccess = canAccessAppointment(role, doctorId, appointment);
  const slotMinutes = state.settings.slotMinutes || 15;

  const [form, setForm] = useState(() => {
    if (appointment) {
      return { ...appointment };
    }

    return {
      patientName: '',
      phone: '',
      age: '',
      doctorId: role === 'doctor' ? String(doctorId) : '',
      date: todayISO(),
      time: '',
      reason: '',
      status: 'booked',
    };
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(false);

  const blocker = useBlocker(isDirty && !allowNavigation);

  useEffect(() => {
    if (!isDirty) return undefined;

    function warnBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', warnBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', warnBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    if (allowNavigation) {
      navigate('/appointments');
    }
  }, [allowNavigation, navigate]);

  useEffect(() => {
    if (isEditing && !appointment) {
      notify('Appointment was not found.');
    }
  }, [isEditing, appointment, notify]);

  const timeSlots = makeSlots(form.doctorId, form.date, slotMinutes, {
    futureOnly: true,
  });

  const availableSlots = timeSlots.filter(
    (slot) =>
      !hasSlotConflict(state.appointments, {
        doctorId: form.doctorId,
        date: form.date,
        time: slot,
        excludeId: id,
      }),
  );

  function updateField(fieldName, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
      ...(fieldName === 'doctorId' || fieldName === 'date'
        ? { time: '' }
        : {}),
    }));
    setTouched((current) => ({ ...current, [fieldName]: true }));
    setIsDirty(true);
  }

  function handleBack() {
    navigate('/appointments');
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!canChooseDoctor(role, doctorId, form.doctorId)) {
      notify('Doctors can only book appointments for their own schedule.');
      return;
    }

    const nextErrors = validateAppointment(
      form,
      state.appointments,
      id || null,
      slotMinutes,
    );

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const appointmentData = {
      ...form,
      doctorId: Number(form.doctorId),
      patientName: form.patientName.trim(),
      phone: form.phone.trim(),
      reason: form.reason.trim(),
      ...(isEditing
        ? { id: appointment.id }
        : {
            id: `apt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            createdAt: new Date().toISOString(),
          }),
    };

    dispatch({
      type: isEditing ? 'UPDATE_APPOINTMENT' : 'ADD_APPOINTMENT',
      appointment: appointmentData,
    });

    setAllowNavigation(true);
    setIsDirty(false);
    notify(isEditing ? 'Appointment updated.' : 'Appointment booked.');
  }

  const liveErrors = validateAppointment(
    form,
    state.appointments,
    id || null,
    slotMinutes,
  );
  const visibleErrors = Object.fromEntries(
    Object.entries(liveErrors).filter(([field]) => touched[field]),
  );

  if (isEditing && appointment && !hasAccess) {
    return (
      <section className="panel">
        <Empty
          title="Access restricted"
          text="Doctors can only open and update appointments assigned to their own profile."
          action={
            <button
              className="primary"
              onClick={() => navigate('/appointments')}
            >
              Back to my appointments
            </button>
          }
        />
      </section>
    );
  }

  if (isEditing && !appointment) {
    return (
      <section className="panel">
        <Empty
          title="Appointment not found"
          text="It may have been removed or the link is invalid."
          action={
            <button
              className="primary"
              onClick={() => navigate('/appointments')}
            >
              Back to appointments
            </button>
          }
        />
      </section>
    );
  }

  return (
    <AppointmentEditorForm
      isEditing={isEditing}
      form={form}
      errors={errors}
      liveErrors={visibleErrors}
      canSubmit={Object.keys(liveErrors).length === 0}
      role={role}
      doctorId={doctorId}
      timeSlots={timeSlots}
      availableSlots={availableSlots}
      showLeaveDialog={blocker.state === 'blocked'}
      onFieldChange={updateField}
      onSubmit={handleSubmit}
      onBack={handleBack}
      onKeepEditing={() => blocker.reset()}
      onDiscard={() => blocker.proceed()}
    />
  );
}

export default AppointmentEditor;
