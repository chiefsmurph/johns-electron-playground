import React, { Component } from 'react';
import Home from '../components/Home';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Plays from '../components/Plays';
import * as PlayActions from '../actions/plays';
import * as RobinhoodActions from '../actions/robinhood';

function mapStateToProps(state) {
  return {
    currentPositions: state.robinhood.currentPositions,
    isLoggedIn: state.robinhood.isLoggedIn,
    robinhood: state.robinhood.instance,
    activePlays: state.plays.active,
    router: state.router
  };
}

function mapDispatchToProps(dispatch) {
  return {
    robinhoodActions: bindActionCreators(RobinhoodActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
