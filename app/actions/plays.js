// @flow
import detailedNonZero from '../backend/app-actions/detailed-non-zero';
import pmJsonStorage from '../utils/pm-json-storage';

export const NEW_PLAY = 'NEW_PLAY';
export const CLEAR_PLAYS = 'CLEAR_PLAYS';
export const MARK_FILLED = 'MARK_FILLED';
export const INIT_PLAYS = 'INIT_PLAYS';

export function registerPlay(payload) {
  return async (dispatch, getState) => {
    dispatch(newPlay(payload));
    await pmJsonStorage.set('plays', getState().plays);
    console.log(await pmJsonStorage.getAll());
  };
}

export function init() {
  return async (dispatch, getState) => {
    const plays = await pmJsonStorage.get('plays');
    console.log('plays', plays);
    if (plays && plays.active) {
      dispatch(initPlays(plays));
    }
  };
}

export function initPlays(plays) {
  return {
    type: INIT_PLAYS,
    plays
  };
}

export function newPlay(payload) {
  return {
    type: NEW_PLAY,
    payload
  };
}

export function clearPlays() {
  return {
    type: CLEAR_PLAYS
  };
}

export function markFilled(ticker) {
  return {
    type: CLEAR_PLAYS,
    ticker
  };
}

// export function incrementIfOdd() {
//   return (dispatch: (action: actionType) => void, getState: () => counterStateType) => {
//     const { counter } = getState();
//
//     if (counter % 2 === 0) {
//       return;
//     }
//
//     dispatch(increment());
//   };
// }
//
// export function incrementAsync(delay: number = 1000) {
//   return (dispatch: (action: actionType) => void) => {
//     setTimeout(() => {
//       dispatch(increment());
//     }, delay);
//   };
// }
