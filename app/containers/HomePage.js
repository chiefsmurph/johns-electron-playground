import React, { Component } from 'react';
import Home from '../components/Home';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as PlayActions from '../actions/plays';
import * as RobinhoodActions from '../actions/robinhood';

function mapStateToProps(state) {
  return {
    gettingPositions: state.robinhood.gettingPositions,
    currentPositions: state.robinhood.currentPositions,
    isLoggedIn: state.robinhood.isLoggedIn,
    robinhood: state.robinhood.instance,
    lastFetched: state.robinhood.lastFetched,
    activePlays: state.plays.active,
    router: state.router
  };
}

function mapDispatchToProps(dispatch) {
  return {
    robinhoodActions: bindActionCreators(RobinhoodActions, dispatch),
    playActions: bindActionCreators(PlayActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
