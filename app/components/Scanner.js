// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Scanner.css';

import findFirstGreen from '../backend/analysis/find-first-green';
import findSwings from '../backend/analysis/find-swings';


export default class Scanner extends Component {
  
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {

  }

  async runScan(scan) {
    console.log('get first greens');
    try {
      this.setState({
        outputText: await scan(this.props.robinhood)
      });
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    return (
      <div>
        <div className={styles.backButton} data-tid="backButton">
          <Link to="/">
            <i className="fa fa-arrow-left fa-3x" />
          </Link>
        </div>
        <button onClick={() => this.runScan(findFirstGreen)}>find first greens</button><br/>
        <button onClick={() => this.runScan(findSwings)}>find swings</button><br/>
        <div>
          <pre>{JSON.stringify(this.state.outputText, null, 2)}</pre>
        </div>
      </div>
    );
  }
}
