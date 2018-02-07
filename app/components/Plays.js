// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Plays.css';

import NewPlayForm from './NewPlayForm';
import PlayTable from './PlayTable';

export default class Plays extends Component {
  componentDidMount() {

  }
  render() {
    return (
      <div>
        <div className={styles.backButton} data-tid="backButton">
          <Link to="/">
            <i className="fa fa-arrow-left fa-3x" />
          </Link>
        </div>
        isloggedin: {JSON.stringify(this.props.isLoggedIn)}
        <NewPlayForm robinhood={this.props.robinhood} onNewPlay={this.props.playActions.registerPlay}/>
        <div className={styles.btnGroup}>
          <button className={styles.btn} onClick={() => this.props.clearPlays()} data-tclass="btn">clearPlays</button>
        </div>
        <div className={`counter ${styles.counter}`} data-tid="counter">
          <PlayTable activePlays={this.props.activePlays} />
        </div>
      </div>
    );
  }
}
