import { createContext, useContext } from 'react';

export const AppointmentContext = createContext(null);

export function useAppointmentContext() {
  return useContext(AppointmentContext);
}
