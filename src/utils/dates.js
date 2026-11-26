function formatDateAsISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function todayISO() {
  return formatDateAsISO(new Date());
}

export function addDaysISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return formatDateAsISO(date);
}

export function dateLabel(isoDate) {
  if (!isoDate) {
    return '—';
  }

  return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function timeLabel(time) {
  if (!time) {
    return '—';
  }

  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}
