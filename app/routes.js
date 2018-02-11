/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';
import ScannerPage from './containers/ScannerPage';

export default () => (
  <App>
    <Switch>
      <Route path="/scanner" component={ScannerPage} />
      <Route path="/" component={HomePage} />
    </Switch>
  </App>
);
