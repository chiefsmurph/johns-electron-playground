// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';

import login from '../backend/rh-actions/login';
import trendingUp from '../backend/rh-actions/trending-up';
import detailedNonZero from '../backend/app-actions/detailed-non-zero';
import findFirstGreen from '../backend/analysis/find-first-green';

import CurrentPositions from './CurrentPositions';
import Modal from './Modal';
import NewPlayForm from './NewPlayForm';

// const promisifyAll = require('es6-promisify-all');
// const storage = promisifyAll(require('electron-json-storage'));
const pmJsonStorage = require('../utils/pm-json-storage');



export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
   }

  async componentDidMount() {
    // await pmJsonStorage.clear();
  }

  async getFirstGreens() {
    console.log('get first greens');
    try {
      this.setState({
        outputText: await findFirstGreen(this.props.robinhood)
      });
    } catch (e) {
      console.log(e);
    }
  }
  toggleModal() {
    console.log('toggle', !this.state.showingModal);
    this.setState({
      showingModal: !this.state.showingModal
    });
  }
  render() {
    return (
      <div>
        <div className={styles.container} data-tid="container">
          <h2>ROBINHACKER</h2>
          <Link to="/plays">to Counter</Link>
          <button onClick={() => this.toggleModal()}>Toggle</button><br/>
          <button onClick={() => this.getFirstGreens()}>get first greens</button><br/>
          current positions last fetched: {this.props.lastFetched}
          <CurrentPositions 
            positions={this.props.currentPositions} />
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
