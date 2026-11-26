export const AUTH_ACCOUNTS = [
  {
    role: 'receptionist',
    doctorId: null,
    name: 'Meera',
    email: 'meera@clinicdesk.in',
    password: 'clinic123',
  },
  {
    role: 'doctor',
    doctorId: 1,
    name: 'Dr. Priya Sharma',
    email: 'priya@clinicdesk.in',
    password: 'doctor123',
  },
  {
    role: 'doctor',
    doctorId: 2,
    name: 'Dr. Arjun Desai',
    email: 'arjun@clinicdesk.in',
    password: 'doctor123',
  },
  {
    role: 'doctor',
    doctorId: 3,
    name: 'Dr. Meera Kulkarni',
    email: 'meera.k@clinicdesk.in',
    password: 'doctor123',
  },
];

export function authenticateUser({ role, email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return null;
  }

  const matched = AUTH_ACCOUNTS.find(
    (account) =>
      account.role === role
      && account.email === normalizedEmail
      && account.password === password,
  );

  if (!matched) {
    return null;
  }

  return {
    role: matched.role,
    doctorId: matched.doctorId,
    name: matched.name,
    email: matched.email,
  };
}
