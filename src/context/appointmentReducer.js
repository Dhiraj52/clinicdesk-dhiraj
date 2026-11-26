import { createSeed, STATUS } from '../utils.js';

export function createInitialState(storageKey = 'clinicdesk.appointments') {
  let savedState = null;

  try {
    savedState = JSON.parse(window.localStorage.getItem(storageKey));
  } catch {
    savedState = null;
  }

  let savedSettings = null;

  try {
    savedSettings = JSON.parse(
      window.localStorage.getItem('clinicdesk.settings'),
    );
  } catch {
    savedSettings = null;
  }

  return {
    appointments: Array.isArray(savedState?.appointments)
      ? savedState.appointments
      : Array.isArray(savedState)
        ? savedState
        : createSeed(),
    settings: {
      clinicName: savedSettings?.clinicName || 'Sunrise Family Clinic',
      slotMinutes: 15,
    },
  };
}

export function reducer(state, action) {
  const timestamp = new Date().toISOString();

  function addHistory(appointment, event, nextStatus) {
    return {
      ...appointment,
      status: nextStatus,
      history: [
        ...(appointment.history || []),
        {
          event,
          at: timestamp,
          from: appointment.status,
          to: nextStatus,
        },
      ],
    };
  }

  switch (action.type) {
    case 'ADD_APPOINTMENT': {
      const appointment = action.appointment;

      return {
        ...state,
        appointments: [
          ...state.appointments,
          {
            ...appointment,
            history: [
              {
                event: 'Appointment created',
                at: timestamp,
                from: null,
                to: appointment.status,
              },
            ],
          },
        ],
      };
    }

    case 'UPDATE_APPOINTMENT': {
      return {
        ...state,
        appointments: state.appointments.map((appointment) => {
          if (appointment.id !== action.appointment.id) {
            return appointment;
          }

          return {
            ...appointment,
            ...action.appointment,
            history: [
              ...(appointment.history || []),
              {
                event: 'Appointment details updated',
                at: timestamp,
                from: appointment.status,
                to: action.appointment.status,
              },
            ],
          };
        }),
      };
    }

    case 'CANCEL_APPOINTMENT': {
      return {
        ...state,
        appointments: state.appointments.map((appointment) => (
          appointment.id === action.id
            ? addHistory(appointment, 'Appointment cancelled', 'cancelled')
            : appointment
        )),
      };
    }

    case 'UPDATE_APPOINTMENT_STATUS': {
      return {
        ...state,
        appointments: state.appointments.map((appointment) => (
          appointment.id === action.id
            ? addHistory(
              appointment,
              action.event || `Status changed to ${STATUS[action.status]?.label || action.status}`,
              action.status,
            )
            : appointment
        )),
      };
    }

    case 'RESET_DATA': {
      return {
        ...state,
        appointments: createSeed(),
      };
    }

    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings,
        },
      };
    }

    default:
      return state;
  }
}
