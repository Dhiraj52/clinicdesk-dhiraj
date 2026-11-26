# ClinicDesk

Front-end appointment and queue management app for Sunrise Family Clinic, built with React 18, Vite, React Router 6, and `useReducer` + Context.

## Getting Started

Requirements: Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (default `http://localhost:5173`).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build production bundle into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest test suite |

## Architecture

- **State & persistence**: `App.jsx` wires `usePersistentReducer` with `appointmentReducer.js` (`clinicdesk.appointments` and `clinicdesk.settings` in `localStorage`). Role, selected doctor, list filters, and pagination state are persisted in `sessionStorage`.
- **Routing**: `src/routes/AppRoutes.jsx` defines lazy-loaded routes for Overview (`/`), Appointments (`/appointments`), Booking/Editing (`/appointments/new`, `/appointments/:id/edit`), Day Summary (`/summary`), and Settings (`/settings`).
- **Role views**: Switch between **Receptionist** (full schedule, booking, editing, check-in/no-show/cancel, settings) and **Doctor** (assigned queue only, consultation transitions).
- **Validation & slots**: 15-minute slots within each doctor's working hours, Indian 10-digit mobile validation, age bounds (`0–120`), duplicate-slot prevention, and unsaved-changes navigation blocking.
