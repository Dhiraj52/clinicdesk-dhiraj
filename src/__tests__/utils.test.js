import { describe, expect, it } from 'vitest';
import seedData from '../data/seed.json';
import {
  addDaysISO,
  createSeed,
  makeSlots,
  validateAppointment,
} from '../utils.js';

describe('ClinicDesk data and validation helpers', () => {
  it('keeps ISO date fields and relative offsets in the seed JSON', () => {
    expect(seedData.doctors).toHaveLength(3);
    expect(seedData.appointments.length).toBeGreaterThanOrEqual(12);
    expect(seedData.appointments.every((appointment) => (
      /^\d{4}-\d{2}-\d{2}$/.test(appointment.date)
      && [-1, 0, 1].includes(appointment.dayOffset)
    ))).toBe(true);
  });

  it('seeds at least 12 appointments across yesterday, today and tomorrow', () => {
    const appointments = createSeed();
    const expectedDates = new Set([
      addDaysISO(-1),
      addDaysISO(0),
      addDaysISO(1),
    ]);
    const actualDates = new Set(appointments.map((item) => item.date));

    expect(appointments.length).toBeGreaterThanOrEqual(12);
    expect(new Set(appointments.map((item) => item.id)).size)
      .toBe(appointments.length);
    expect(appointments.every((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date)))
      .toBe(true);
    expect(actualDates).toEqual(expectedDates);
    expect(new Set(appointments.map((item) => item.doctorId)))
      .toEqual(new Set([1, 2, 3]));
  });

  it('generates 15-minute slots inside doctor working hours', () => {
    expect(makeSlots(1, addDaysISO(0))).toEqual([
      '09:00',
      '09:15',
      '09:30',
      '09:45',
      '10:00',
      '10:15',
      '10:30',
      '10:45',
      '11:00',
      '11:15',
      '11:30',
      '11:45',
      '12:00',
      '12:15',
      '12:30',
      '12:45',
    ]);
  });

  it('validates phone, age and duplicate appointment slots', () => {
    const form = {
      patientName: 'Test Patient',
      phone: '9876543210',
      age: '28',
      doctorId: 1,
      date: addDaysISO(1),
      time: '09:30',
      reason: 'Check-up',
    };
    const existingAppointments = [{
      id: 'existing-appointment',
      doctorId: 1,
      date: form.date,
      time: form.time,
      status: 'booked',
    }];

    expect(validateAppointment(form, existingAppointments).time)
      .toMatch(/already has/);
    expect(validateAppointment({ ...form, phone: '1234567890' }, []).phone)
      .toMatch(/starting with 6, 7, 8, or 9/);
    expect(validateAppointment({ ...form, age: '121' }, []).age)
      .toMatch(/0 and 120/);
  });

  it('does not treat cancelled appointments as slot conflicts', () => {
    const form = {
      patientName: 'Test Patient',
      phone: '9876543210',
      age: '28',
      doctorId: 1,
      date: addDaysISO(1),
      time: '09:30',
      reason: 'Check-up',
    };
    const cancelledAppointment = {
      id: 'cancelled-appointment',
      doctorId: 1,
      date: form.date,
      time: form.time,
      status: 'cancelled',
    };

    expect(validateAppointment(form, [cancelledAppointment]).time).toBeUndefined();
  });
});
