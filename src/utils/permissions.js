/** Return true when the selected role may view or edit an appointment. */
export function canAccessAppointment(role, selectedDoctorId, appointment) {
  if (role !== 'doctor') {
    return true;
  }

  return Boolean(
    appointment
    && Number(appointment.doctorId) === Number(selectedDoctorId),
  );
}

/** Only receptionists create bookings; doctors work from their assigned queue. */
export function canCreateAppointment(role) {
  return role === 'receptionist';
}

/** Doctors may only select their own schedule when a doctor selection is needed. */
export function canChooseDoctor(role, selectedDoctorId, requestedDoctorId) {
  if (role !== 'doctor') {
    return true;
  }

  return Number(selectedDoctorId) === Number(requestedDoctorId);
}

/** Return the queue actions that belong to each role and current status. */
export function getAllowedQueueActions(role, currentStatus) {
  if (role === 'receptionist') {
    if (currentStatus === 'booked') {
      return ['arrived', 'no_show', 'cancelled'];
    }

    return ['completed', 'cancelled'].includes(currentStatus)
      ? []
      : ['cancelled'];
  }

  if (role === 'doctor' && currentStatus === 'arrived') {
    return ['in_consultation'];
  }

  if (role === 'doctor' && currentStatus === 'in_consultation') {
    return ['completed'];
  }

  return [];
}
