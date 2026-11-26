import { describe, expect, it } from 'vitest';
import {
  canAccessAppointment,
  canChooseDoctor,
  canCreateAppointment,
  getAllowedQueueActions,
} from '../utils/permissions.js';

describe('role permissions', () => {
  const appointment = {
    id: 'appointment-1',
    doctorId: 2,
  };

  it('lets doctors access only appointments assigned to them', () => {
    expect(canAccessAppointment('doctor', 2, appointment)).toBe(true);
    expect(canAccessAppointment('doctor', 1, appointment)).toBe(false);
  });

  it('lets receptionists access appointments across all doctors', () => {
    expect(canAccessAppointment('receptionist', 1, appointment)).toBe(true);
  });

  it('allows only receptionists to create appointments', () => {
    expect(canCreateAppointment('receptionist')).toBe(true);
    expect(canCreateAppointment('doctor')).toBe(false);
  });

  it('keeps doctor selection within the signed-in doctor profile', () => {
    expect(canChooseDoctor('doctor', 2, 2)).toBe(true);
    expect(canChooseDoctor('doctor', 2, 1)).toBe(false);
    expect(canChooseDoctor('receptionist', 2, 1)).toBe(true);
  });

  it('gives receptionists front-desk actions for booked appointments', () => {
    expect(getAllowedQueueActions('receptionist', 'booked'))
      .toEqual(['arrived', 'no_show', 'cancelled']);
  });

  it('gives doctors only the consultation workflow actions', () => {
    expect(getAllowedQueueActions('doctor', 'arrived'))
      .toEqual(['in_consultation']);
    expect(getAllowedQueueActions('doctor', 'in_consultation'))
      .toEqual(['completed']);
    expect(getAllowedQueueActions('doctor', 'booked')).toEqual([]);
  });
});
