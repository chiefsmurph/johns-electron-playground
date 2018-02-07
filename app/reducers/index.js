// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
// import counter from './counter';
import plays from './plays';
import robinhood from './robinhood';

const rootReducer = combineReducers({
  // counter,
  plays,
  robinhood,
  router,
});

export default rootReducer;
