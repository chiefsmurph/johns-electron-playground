// @flow
import { LOGIN, LOGIN_SUCCESS, LOGIN_FAIL, SET_CURRENT_POSITIONS } from '../actions/robinhood';

export default function robinhood(state = {
  isLoggedIn: false,
  instance: null,
  currentPositions: [],
  lastFetched: null
}, action) {
  switch (action.type) {
    case LOGIN:
      return state;
    case LOGIN_SUCCESS:
      return {
        isLoggedIn: true,
        instance: action.instance
      };
    case LOGIN_FAIL:
      return {
        isLoggedIn: false,
        error: action.error
      };
    case SET_CURRENT_POSITIONS:
      return {
        ...state,
        currentPositions: action.positions,
        lastFetched: action.lastFetched
      }
    default:
      return state;
  }
}
