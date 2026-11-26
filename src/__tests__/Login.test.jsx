import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';

function renderApp(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>,
  );
}

describe('Login flow', () => {
  it('redirects unauthenticated users to the login page', async () => {
    renderApp(['/']);

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Receptionist' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Doctor' })).toBeTruthy();
  });

  it('shows a generic error for invalid credentials or mismatched role', async () => {
    const user = userEvent.setup();
    renderApp(['/login']);

    await screen.findByRole('heading', { name: 'Welcome back' });
    await user.type(screen.getByLabelText('Email'), 'priya@clinicdesk.in');
    await user.type(screen.getByLabelText('Password'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /Sign in as Receptionist/i }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/Invalid credentials/i);
  });

  it('authenticates a receptionist and directs them to the main dashboard', async () => {
    const user = userEvent.setup();
    renderApp(['/login']);

    await screen.findByRole('heading', { name: 'Welcome back' });
    await user.type(screen.getByLabelText('Email'), 'meera@clinicdesk.in');
    await user.type(screen.getByLabelText('Password'), 'clinic123');
    await user.click(screen.getByRole('button', { name: /Sign in as Receptionist/i }));

    expect(await screen.findByText('Overview')).toBeTruthy();
    expect(await screen.findByText("Today's queue")).toBeTruthy();
  });

  it('authenticates a doctor and directs them to their appointments schedule', async () => {
    const user = userEvent.setup();
    renderApp(['/login']);

    await screen.findByRole('heading', { name: 'Welcome back' });
    await user.click(screen.getByRole('button', { name: 'Doctor' }));
    await user.type(screen.getByLabelText('Email'), 'priya@clinicdesk.in');
    await user.type(screen.getByLabelText('Password'), 'doctor123');
    await user.click(screen.getByRole('button', { name: /Sign in as Doctor/i }));

    expect(await screen.findByRole('heading', { name: 'Appointments' })).toBeTruthy();
    expect(screen.getByText(/Dr\. Priya Sharma · Doctor/)).toBeTruthy();
  });
});
