import { describe, expect, it } from 'vitest';
import { reducer } from '../context/appointmentReducer.js';

const emptyState = {
  appointments: [],
  settings: {
    clinicName: 'Sunrise Family Clinic',
    slotMinutes: 15,
  },
};

describe('appointment reducer', () => {
  it('adds an appointment and records its creation', () => {
    const appointment = {
      id: 'appointment-1',
      patientName: 'Test Patient',
      status: 'booked',
    };

    const nextState = reducer(emptyState, {
      type: 'ADD_APPOINTMENT',
      appointment,
    });

    expect(nextState.appointments).toHaveLength(1);
    expect(nextState.appointments[0].history[0].event)
      .toBe('Appointment created');
  });

  it('updates an existing appointment', () => {
    const state = {
      ...emptyState,
      appointments: [{ id: 'appointment-1', status: 'booked', history: [] }],
    };

    const nextState = reducer(state, {
      type: 'UPDATE_APPOINTMENT',
      appointment: {
        id: 'appointment-1',
        patientName: 'Updated Patient',
        status: 'booked',
      },
    });

    expect(nextState.appointments[0].patientName).toBe('Updated Patient');
    expect(nextState.appointments[0].history).toHaveLength(1);
  });

  it('cancels an appointment and records the transition', () => {
    const state = {
      ...emptyState,
      appointments: [{ id: 'appointment-1', status: 'booked', history: [] }],
    };

    const nextState = reducer(state, {
      type: 'CANCEL_APPOINTMENT',
      id: 'appointment-1',
    });

    expect(nextState.appointments[0].status).toBe('cancelled');
    expect(nextState.appointments[0].history).toHaveLength(1);
  });

  it('restores the seed appointments', () => {
    const state = {
      ...emptyState,
      appointments: [],
    };

    const nextState = reducer(state, { type: 'RESET_DATA' });

    expect(nextState.appointments.length).toBeGreaterThanOrEqual(12);
  });
});
