/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';
import PlaysPage from './containers/PlaysPage';

export default () => (
  <App>
    <Switch>
      <Route path="/plays" component={PlaysPage} />
      <Route path="/" component={HomePage} />
    </Switch>
  </App>
);
