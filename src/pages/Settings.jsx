import { useState } from 'react';
import { useStore } from '../hooks/useStore.js';
import { PageTitle, Field } from '../components/ui.jsx';

function ClinicSettingsForm({ clinicName, onSave }) {
  const [name, setName] = useState(clinicName);

  function handleSubmit(event) {
    event.preventDefault();
    onSave(name.trim() || 'Sunrise Family Clinic');
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field label="Clinic name">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </Field>

      <Field label="Appointment slot duration">
        <input value="15 minutes" readOnly />
      </Field>

      <p className="field-hint">
        Settings and appointments are saved locally in this browser.
      </p>

      <button className="primary" type="submit">Save settings</button>
    </form>
  );
}

function SettingsPage() {
  const { state, dispatch, notify, askConfirm } = useStore();

  function saveClinicName(clinicName) {
    dispatch({
      type: 'UPDATE_SETTINGS',
      settings: {
        clinicName,
        slotMinutes: 15,
      },
    });
    notify('Clinic settings saved.');
  }

  function resetDemoData() {
    askConfirm('Reset all appointments to demo data?', () => {
      window.localStorage.removeItem('clinicdesk.appointments');
      dispatch({ type: 'RESET_DATA' });
      notify('Demo appointments restored.');
    });
  }

  return (
    <>
      <PageTitle
        eyebrow="PREFERENCES"
        title="Settings"
        subtitle="Manage local demo preferences and clinic setup."
      />

      <section className="panel settings-panel">
        <h3>Clinic settings</h3>
        <ClinicSettingsForm
          clinicName={state.settings.clinicName}
          onSave={saveClinicName}
        />
      </section>

      <section className="panel settings-panel">
        <h3>Demo data</h3>
        <p className="muted">
          Restore the original sample appointments. This cannot be undone.
        </p>
        <button className="danger" onClick={resetDemoData}>
          Reset demo data
        </button>
      </section>

      <section className="panel settings-panel">
        <h3>Data and storage</h3>
        <p className="muted">
          Appointments and clinic settings are stored in localStorage. The
          selected role and doctor are stored in sessionStorage and reset when
          this browser tab closes.
        </p>
      </section>
    </>
  );
}

export default SettingsPage;
