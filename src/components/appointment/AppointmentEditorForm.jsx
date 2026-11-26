import { PageTitle } from '../ui.jsx';
import PatientDetailsFields from './PatientDetailsFields.jsx';
import AppointmentScheduleFields from './AppointmentScheduleFields.jsx';
import UnsavedChangesDialog from './UnsavedChangesDialog.jsx';

function AppointmentEditorForm({
  isEditing,
  form,
  errors,
  liveErrors,
  canSubmit,
  role,
  doctorId,
  timeSlots,
  availableSlots,
  showLeaveDialog,
  onFieldChange,
  onSubmit,
  onBack,
  onKeepEditing,
  onDiscard,
}) {
  return (
    <>
      <PageTitle
        eyebrow={isEditing ? 'UPDATE RECORD' : 'NEW BOOKING'}
        title={isEditing ? 'Edit appointment' : 'Book an appointment'}
        subtitle="Enter patient details and select an available doctor slot."
        action={(
          <button className="secondary" onClick={onBack}>
            ← Back
          </button>
        )}
      />

      <form
        className="panel form-panel"
        onSubmit={onSubmit}
        noValidate
      >
        <PatientDetailsFields
          form={form}
          errors={errors}
          liveErrors={liveErrors}
          onFieldChange={onFieldChange}
        />

        <AppointmentScheduleFields
          form={form}
          isEditing={isEditing}
          errors={errors}
          liveErrors={liveErrors}
          role={role}
          doctorId={doctorId}
          timeSlots={timeSlots}
          availableSlots={availableSlots}
          onFieldChange={onFieldChange}
        />

        <div className="form-footer">
          <button
            type="button"
            className="secondary"
            onClick={onBack}
          >
            Discard
          </button>
          <button
            className="primary"
            type="submit"
            disabled={!canSubmit}
          >
            {isEditing ? 'Save changes' : 'Book appointment'}
          </button>
        </div>
      </form>

      {showLeaveDialog && (
        <UnsavedChangesDialog
          onKeepEditing={onKeepEditing}
          onDiscard={onDiscard}
        />
      )}
    </>
  );
}

export default AppointmentEditorForm;
