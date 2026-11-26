import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDisplayStatus } from '../utils.js';
import useDebounce from './useDebounce.js';
import { APPOINTMENTS_PER_PAGE } from '../utils/constants.js';

function sortAppointments(appointments, sortOrder) {
  return [...appointments].sort((first, second) => {
    if (sortOrder === 'name') {
      return first.patientName.localeCompare(second.patientName);
    }

    if (sortOrder === 'name-desc') {
      return second.patientName.localeCompare(first.patientName);
    }

    const firstDateTime = `${first.date} ${first.time}`;
    const secondDateTime = `${second.date} ${second.time}`;

    return sortOrder === 'date-desc'
      ? secondDateTime.localeCompare(firstDateTime)
      : firstDateTime.localeCompare(secondDateTime);
  });
}

/** Manages URL-backed filters, debounced search, sorting and pagination. */
export function useAppointmentList(appointments, role, doctorId) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => {
    let savedFilters = {};

    try {
      savedFilters = JSON.parse(
        window.sessionStorage.getItem('clinicdesk.filters') || '{}',
      );
    } catch {
      savedFilters = {};
    }

    return {
      search: searchParams.get('q') ?? savedFilters.search ?? '',
      doctor: searchParams.get('doctor') ?? savedFilters.doctor ?? 'all',
      status: searchParams.get('status') ?? savedFilters.status ?? 'all',
      from: searchParams.get('from') ?? savedFilters.from ?? '',
      to: searchParams.get('to') ?? savedFilters.to ?? '',
      sort: searchParams.get('sort') ?? savedFilters.sort ?? 'date-asc',
    };
  });
  const [page, setPage] = useState(() => (
    Number(searchParams.get('page'))
    || Number(window.sessionStorage.getItem('clinicdesk.page'))
    || 1
  ));
  const debouncedSearch = useDebounce(filters.search, 300);
  const activeDoctor = role === 'doctor'
    ? String(doctorId)
    : filters.doctor;

  useEffect(() => {
    window.sessionStorage.setItem(
      'clinicdesk.filters',
      JSON.stringify(filters),
    );
    window.sessionStorage.setItem('clinicdesk.page', String(page));
  }, [filters, page]);

  useEffect(() => {
    const query = {};

    if (filters.search) query.q = filters.search;
    if (activeDoctor !== 'all') query.doctor = activeDoctor;
    if (filters.status !== 'all') query.status = filters.status;
    if (filters.from) query.from = filters.from;
    if (filters.to) query.to = filters.to;
    if (filters.sort !== 'date-asc') query.sort = filters.sort;
    if (page > 1) query.page = String(page);

    setSearchParams(query, { replace: true });
  }, [filters, activeDoctor, page, setSearchParams]);

  const filteredAppointments = useMemo(() => {
    const searchText = debouncedSearch.toLowerCase();
    const matchingAppointments = appointments.filter((appointment) => {
      const belongsToDoctor = (
        role !== 'doctor'
        || Number(appointment.doctorId) === Number(doctorId)
      );
      const matchesSearch = `${appointment.patientName} ${appointment.phone}`
        .toLowerCase()
        .includes(searchText);
      const matchesDoctor = (
        activeDoctor === 'all'
        || Number(appointment.doctorId) === Number(activeDoctor)
      );
      const matchesStatus = (
        filters.status === 'all'
        || appointment.status === filters.status
        || (
          filters.status === 'booked_late'
          && getDisplayStatus(appointment) === 'booked_late'
        )
      );
      const matchesDateRange = (
        (!filters.from || appointment.date >= filters.from)
        && (!filters.to || appointment.date <= filters.to)
      );

      return (
        belongsToDoctor
        && matchesSearch
        && matchesDoctor
        && matchesStatus
        && matchesDateRange
      );
    });

    return sortAppointments(matchingAppointments, filters.sort);
  }, [
    appointments,
    role,
    doctorId,
    activeDoctor,
    filters.status,
    filters.from,
    filters.to,
    filters.sort,
    debouncedSearch,
  ]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredAppointments.length / APPOINTMENTS_PER_PAGE),
  );
  const currentPage = Math.min(page, pageCount);
  const visibleAppointments = filteredAppointments.slice(
    (currentPage - 1) * APPOINTMENTS_PER_PAGE,
    currentPage * APPOINTMENTS_PER_PAGE,
  );

  function updateFilter(name, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
    setPage(1);
  }

  return {
    filters,
    updateFilter,
    page: currentPage,
    setPage,
    pageCount,
    filteredAppointments,
    visibleAppointments,
  };
}
