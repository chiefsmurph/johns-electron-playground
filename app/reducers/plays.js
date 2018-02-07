// @flow
import { NEW_PLAY, CLEAR_PLAYS, INIT_PLAYS } from '../actions/plays';

export default function plays(state = {
  active: [],
}, action: actionType) {
  switch (action.type) {
    case INIT_PLAYS:
      return action.plays;
    case NEW_PLAY:
      return {
        active: [
          ...state.active,
          action.payload
        ]
      };
    case CLEAR_PLAYS:
      return {
        active: []
      };
    default:
      return state;
  }
}
