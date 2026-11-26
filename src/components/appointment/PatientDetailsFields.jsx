import { Field } from '../ui.jsx';

function PatientDetailsFields({ form, errors, liveErrors, onFieldChange }) {
  return (
    <div className="form-section">
      <h3>Patient details</h3>
      <div className="form-grid">
        <Field
          label="Patient full name"
          error={errors.patientName || liveErrors.patientName}
        >
          <input
            autoFocus
            value={form.patientName}
            onChange={(event) => onFieldChange('patientName', event.target.value)}
            placeholder="e.g. Aditi Deshmukh"
          />
        </Field>

        <Field label="Phone number" error={errors.phone || liveErrors.phone}>
          <input
            value={form.phone}
            onChange={(event) => onFieldChange(
              'phone',
              event.target.value.replace(/\D/g, '').slice(0, 10),
            )}
            inputMode="numeric"
            placeholder="10-digit mobile number"
          />
        </Field>

        <Field label="Age" error={errors.age || liveErrors.age}>
          <input
            type="number"
            min="0"
            max="120"
            value={form.age ?? ''}
            onChange={(event) => onFieldChange('age', event.target.value)}
            placeholder="0–120"
          />
        </Field>

        <Field
          label="Reason for visit"
          error={errors.reason || liveErrors.reason}
          wide
        >
          <textarea
            rows="3"
            maxLength="200"
            value={form.reason}
            onChange={(event) => onFieldChange('reason', event.target.value)}
            placeholder="Briefly describe the reason for appointment"
          />
          <small className="field-hint">
            {form.reason.length}/200 characters
          </small>
        </Field>
      </div>
    </div>
  );
}

export default PatientDetailsFields;
