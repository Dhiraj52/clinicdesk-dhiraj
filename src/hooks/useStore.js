import { useAppointmentContext } from '../context/AppointmentContext.jsx';

export function useStore() {
  return useAppointmentContext();
}
