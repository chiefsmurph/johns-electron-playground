// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';

import login from '../backend/rh-actions/login';
import trendingUp from '../backend/rh-actions/trending-up';
import detailedNonZero from '../backend/app-actions/detailed-non-zero';

import CurrentPositions from './CurrentPositions';
import Modal from './Modal';
import NewPlayForm from './NewPlayForm';

import activeSell from '../backend/app-actions/active-sell';

// const promisifyAll = require('es6-promisify-all');
// const storage = promisifyAll(require('electron-json-storage'));
const pmJsonStorage = require('../utils/pm-json-storage');



export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onActiveSell = this.onActiveSell.bind(this);
   }

  async componentDidMount() {
    // await pmJsonStorage.clear();
  }
  toggleModal() {
    console.log('toggle', !this.state.showingModal);
    this.setState({
      showingModal: !this.state.showingModal
    });
  }
  async onActiveSell(ticker, quantity) {
    await activeSell(this.props.robinhood, {ticker, quantity});
  }
  render() {
    return (
      <div>
        <div className={styles.container} data-tid="container">
          <Link to="/scanner">to Scanner</Link>
          <button onClick={() => this.toggleModal()}>New Play</button><br/>
          last fetched: {this.props.lastFetched}
          {this.props.gettingPositions ? (
            <i>getting positions{this.props.gettingPositions}</i>
          ) : (
            <a onClick={() => this.props.robinhoodActions.getCurrentPositions()}>refresh positions{this.props.gettingPositions}</a>
          )}
          <CurrentPositions
            positions={this.props.currentPositions}
            onActiveSell={this.onActiveSell} />
        </div>
        <pre>{JSON.stringify(this.state.outputText, null, 2)}</pre>
        {this.state.showingModal && (
          <Modal
            title='New Play'
            onCancel={() => this.setState({ showingModal: false })}>

            <NewPlayForm
              robinhood={this.props.robinhood}
              onNewPlay={this.props.playActions.registerPlay}
            />

          </Modal>
        )}
      </div>
    );
  }
}
