import { DOCTORS } from './doctors.js';
import { todayISO } from './dates.js';

export const STATUS = {
  booked: { label: 'Booked', color: 'blue' },
  booked_late: { label: 'Booked late', color: 'red' },
  arrived: { label: 'Arrived', color: 'amber' },
  in_consultation: { label: 'In Consultation', color: 'purple' },
  completed: { label: 'Completed', color: 'green' },
  no_show: { label: 'No-show', color: 'gray' },
  cancelled: { label: 'Cancelled', color: 'red' },
};

function convertTimeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatMinutesAsTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');

  return `${hours}:${minutes}`;
}

function isSlotInFuture(date, time) {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);

  const slotDateTime = new Date(year, month - 1, day, hours, minutes);

  return slotDateTime > new Date();
}

export function makeSlots(
  doctorId,
  date,
  slotMinutes = 15,
  { futureOnly = false } = {},
) {
  const doctor = DOCTORS.find((item) => item.id === Number(doctorId));

  if (!doctor || !date) {
    return [];
  }

  const [startTime, endTime] = doctor.hours;
  const startMinutes = convertTimeToMinutes(startTime);
  const endMinutes = convertTimeToMinutes(endTime);
  const interval = Math.max(5, Number(slotMinutes) || 15);
  const slots = [];

  for (
    let currentMinutes = startMinutes;
    currentMinutes < endMinutes;
    currentMinutes += interval
  ) {
    slots.push(formatMinutesAsTime(currentMinutes));
  }

  return futureOnly
    ? slots.filter((slot) => isSlotInFuture(date, slot))
    : slots;
}

export function hasSlotConflict(
  appointments,
  { doctorId, date, time, excludeId = null },
) {
  return appointments.some(
    (appointment) =>
      appointment.id !== excludeId &&
      appointment.status !== 'cancelled' &&
      Number(appointment.doctorId) === Number(doctorId) &&
      appointment.date === date &&
      appointment.time === time,
  );
}

export function validateAppointment(
  form,
  appointments,
  editingId = null,
  slotMinutes = 15,
) {
  const errors = {};
  const name = form.patientName.trim();
  const phone = form.phone.trim();
  const reason = form.reason.trim();

  if (!/^[A-Za-z][A-Za-z ]{1,}$/.test(name) || name.length < 3) {
    errors.patientName =
      'Enter a name with at least 3 letters (letters and spaces only).';
  }

  if (!/^[6789]\d{9}$/.test(phone)) {
    errors.phone =
      'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
  }

  const age = Number(form.age);
  if (form.age === '' || !Number.isInteger(age) || age < 0 || age > 120) {
    errors.age = 'Enter an age between 0 and 120.';
  }

  if (!form.doctorId) {
    errors.doctorId = 'Choose a doctor.';
  }

  if (!form.date) {
    errors.date = 'Choose a date.';
  } else if (form.date < todayISO()) {
    errors.date = 'Past dates are not allowed.';
  }

  const validSlots = makeSlots(form.doctorId, form.date, slotMinutes, {
    futureOnly: true,
  });

  if (!form.time) {
    errors.time = 'Choose a time slot.';
  } else if (!validSlots.includes(form.time)) {
    errors.time = `Choose a valid ${slotMinutes}-minute doctor slot.`;
  }

  if (!reason) {
    errors.reason = 'Reason is required.';
  }

  if (form.reason.length > 200) {
    errors.reason = 'Reason must be 200 characters or fewer.';
  }

  if (
    hasSlotConflict(appointments, {
      doctorId: form.doctorId,
      date: form.date,
      time: form.time,
      excludeId: editingId,
    })
  ) {
    errors.time = 'This doctor already has an appointment in that slot.';
  }

  return errors;
}

export function isLateAppointment(appointment, now = new Date()) {
  if (appointment.status !== 'booked' || appointment.date !== todayISO()) {
    return false;
  }

  const scheduledMinutes = convertTimeToMinutes(appointment.time);
  const scheduledTime = new Date(now);
  scheduledTime.setHours(
    Math.floor(scheduledMinutes / 60),
    scheduledMinutes % 60,
    0,
    0,
  );

  const minutesLate = now.getTime() - scheduledTime.getTime();
  return minutesLate > 15 * 60 * 1000;
}

export function getDisplayStatus(appointment) {
  return isLateAppointment(appointment)
    ? 'booked_late'
    : appointment.status;
}
