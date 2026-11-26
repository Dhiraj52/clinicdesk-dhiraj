import { DOCTORS, timeLabel, todayISO } from "../../utils.js";
import { Field } from "../ui.jsx";

function AppointmentScheduleFields({
  form,
  isEditing,
  errors,
  liveErrors,
  role,
  doctorId,
  timeSlots,
  availableSlots,
  onFieldChange,
}) {
  return (
    <div className="form-section">
      <h3>Appointment details</h3>
      <div className="form-grid">
        <Field label="Doctor" error={errors.doctorId || liveErrors.doctorId}>
          <select
            value={form.doctorId}
            disabled={role === "doctor"}
            onChange={(event) => onFieldChange("doctorId", event.target.value)}
          >
            <option value="">Select doctor</option>
            {DOCTORS.filter(
              (doctor) => role !== "doctor" || doctor.id === doctorId,
            ).map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Appointment date" error={errors.date || liveErrors.date}>
          <input
            type="date"
            min={todayISO()}
            value={form.date}
            onChange={(event) => onFieldChange("date", event.target.value)}
          />
        </Field>

        {timeSlots.length === 0 && form.doctorId && form.date && (
          <div className="no-slots-message">
            <strong>No Available Slots!</strong>
            <p>
              All appointment slots for this date have passed or are
              unavailable. Please select another date.
            </p>
          </div>
        )}

        <Field
          label="Available time slot"
          error={errors.time || liveErrors.time}
        >
          <select
            value={form.time}
            onChange={(event) => onFieldChange("time", event.target.value)}
            disabled={!form.doctorId || !form.date}
          >
            <option value="">Select time</option>
            {timeSlots.map((slot) => {
              const isAvailable = availableSlots.includes(slot);
              const isCurrentSelection = slot === form.time;

              return (
                <option
                  key={slot}
                  value={slot}
                  disabled={!isAvailable && !isCurrentSelection}
                >
                  {timeLabel(slot)}
                  {!isAvailable && !isCurrentSelection ? " — Booked" : ""}
                </option>
              );
            })}
          </select>
        </Field>

        {!isEditing && (
          <Field label="Initial status">
            <select
              value={form.status}
              onChange={(event) => onFieldChange("status", event.target.value)}
            >
              <option value="booked">Booked</option>
              <option value="arrived">Arrived</option>
            </select>
          </Field>
        )}
      </div>

      <p className="field-hint">
        Slots are 15 minutes and follow the selected doctor's working hours.
        Cancelled appointments do not block a time slot.
      </p>
    </div>
  );
}

export default AppointmentScheduleFields;
