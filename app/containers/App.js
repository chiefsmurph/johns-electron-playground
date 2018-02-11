// @flow
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as PlayActions from '../actions/plays';
import * as RobinhoodActions from '../actions/robinhood';

function mapStateToProps(state) {
  return {
    isLoggedIn: state.robinhood.isLoggedIn,
    robinhood: state.robinhood.instance,
    activePlays: state.plays.active,
    router: state.router
  };
}

function mapDispatchToProps(dispatch) {
  return {
    playActions: bindActionCreators(PlayActions, dispatch),
    robinhoodActions: bindActionCreators(RobinhoodActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(class App extends React.Component {
  async componentDidMount() {
    this.props.robinhoodActions.loginRh()
      .then(() => this.props.playActions.init());
  }
  render() {
    return (
      <div>
        <h2>ROBINHACKER</h2>
        {this.props.children}
      </div>
    );
  }
})
