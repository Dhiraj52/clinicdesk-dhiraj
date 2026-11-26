import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import App from '../App.jsx';

describe('ClinicDesk app smoke test', () => {
    it('renders the overview and clinic queue for a signed-in receptionist', async () => {
      window.sessionStorage.setItem(
        'clinicdesk.auth',
        JSON.stringify({
          role: 'receptionist',
          doctorId: null,
          name: 'Meera',
          email: 'meera@clinicdesk.in',
        }),
      );

      const router = createMemoryRouter([
        {
          path: '*',
          element: <App />,
        },
      ]);

      render(<RouterProvider router={router} />);

      expect(await screen.findByText('Overview')).toBeTruthy();
      expect(await screen.findByText("Today's queue")).toBeTruthy();
    });
  });
