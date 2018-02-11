import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Scanner from '../components/Scanner';
import * as PlayActions from '../actions/plays';
import * as RobinhoodActions from '../actions/robinhood';

function mapStateToProps(state) {
  return {
    isLoggedIn: state.robinhood.isLoggedIn,
    robinhood: state.robinhood.instance,
    activePlays: state.plays.active
  };
}

function mapDispatchToProps(dispatch) {
  return {
    playActions: bindActionCreators(PlayActions, dispatch),
    robinhoodActions: bindActionCreators(RobinhoodActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Scanner);
