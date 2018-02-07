// @flow
import { LOGIN, LOGIN_SUCCESS, LOGIN_FAIL } from '../actions/robinhood';

export default function robinhood(state = {
  isLoggedIn: false,
  instance: null,
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
    default:
      return state;
  }
}
