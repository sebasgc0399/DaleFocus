import { describe, expect, it } from 'vitest';
import { ActionTypes, appReducer, initialState } from './AppContext';

describe('appReducer', () => {
  it('SET_SCREEN cambia currentScreen', () => {
    const nextState = appReducer(initialState, {
      type: ActionTypes.SET_SCREEN,
      payload: 'dashboard',
    });

    expect(nextState.currentScreen).toBe('dashboard');
  });

  it('RESET vuelve a initialState', () => {
    const dirtyState = {
      ...initialState,
      currentScreen: 'pomodoro',
      barrier: 'ansiedad',
      rewardMessage: 'Buen trabajo',
    };

    const nextState = appReducer(dirtyState, { type: ActionTypes.RESET });

    expect(nextState).toEqual(initialState);
  });
});
