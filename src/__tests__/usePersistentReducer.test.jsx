import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePersistentReducer } from '../hooks/usePersistentReducer.js';

function counterReducer(state, action) {
  if (action.type === 'increment') {
    return { count: state.count + 1 };
  }

  return state;
}

function createCounterState(storageKey) {
  const savedState = window.localStorage.getItem(storageKey);

  return savedState
    ? JSON.parse(savedState)
    : { count: 0 };
}

describe('usePersistentReducer', () => {
  it('writes reducer updates to localStorage', () => {
    const { result } = renderHook(() => usePersistentReducer(
      counterReducer,
      createCounterState,
      'test.counter',
    ));

    act(() => {
      result.current[1]({ type: 'increment' });
    });

    expect(result.current[0].count).toBe(1);
    expect(JSON.parse(window.localStorage.getItem('test.counter')))
      .toEqual({ count: 1 });
  });

  it('restores an existing saved value on first render', () => {
    window.localStorage.setItem('test.counter', JSON.stringify({ count: 7 }));

    const { result } = renderHook(() => usePersistentReducer(
      counterReducer,
      createCounterState,
      'test.counter',
    ));

    expect(result.current[0].count).toBe(7);
  });
});
