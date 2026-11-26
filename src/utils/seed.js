import seedData from '../data/seed.json';
import { addDaysISO } from './dates.js';

export function createSeed() {
  return seedData.appointments.map((record, index) => ({
    id: record.id || `seed-${1001 + index}`,
    patientName: record.patientName,
    phone: record.phone,
    doctorId: record.doctorId,
    // Rebase the ISO sample date so the demo always contains yesterday, today and tomorrow.
    date: Number.isInteger(record.dayOffset)
      ? addDaysISO(record.dayOffset)
      : record.date,
    time: record.time,
    reason: record.reason,
    status: record.status,
    age: record.age,
    createdAt: new Date().toISOString(),
    history: [],
  }));
}
