import seedData from '../data/seed.json';

// Doctor information lives in seed.json so the demo data has one clear source.
export const DOCTORS = seedData.doctors;

export function getDoctorById(doctorId) {
  return DOCTORS.find((doctor) => doctor.id === Number(doctorId));
}

export function getDoctorName(doctorId) {
  return getDoctorById(doctorId)?.name || '—';
}
