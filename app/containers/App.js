// @flow
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as PlayActions from '../actions/plays';
import * as RobinhoodActions from '../actions/robinhood';

type Props = {
  children: React.Node
};

function mapDispatchToProps(dispatch) {
  return {
    playActions: bindActionCreators(PlayActions, dispatch),
    robinhoodActions: bindActionCreators(RobinhoodActions, dispatch),
  };
}

export default connect(() => ({}), mapDispatchToProps)(class App extends React.Component {
  props: Props;
  async componentDidMount() {
    this.props.robinhoodActions.loginRh();
    // this.props.playActions.init();
  }
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
})
