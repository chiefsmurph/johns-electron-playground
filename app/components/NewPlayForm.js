import React, { Component } from 'react';
import lookup from '../backend/utils/lookup';

const twoDecs = num => +(num).toFixed(2);
const INITIAL_STATE = {
  numShares: 1,
  buyPrice: '',
  highSell: '',
  lowSell: '',
  foundPrice: '',
  totalCost: '',
  ticker: ''
};
export default class NewPlayForm extends Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }
  setBuyPrice(price) {
    // if (!price) return;
    this.setState({
      buyPrice: price,
      highSell: twoDecs(price * 1.1),
      lowSell: twoDecs(price * 0.9)
    });
  }
  setTotalCost(price, numShares) {
    this.setState({
      totalCost: twoDecs(price * numShares)
    });
  }
  setNumShares(num) {
    this.setState({
      numShares: num
    });
    if (!num) return;
    this.setTotalCost(this.state.buyPrice, num);
  }
  async getPrice(ticker) {
    const { currentPrice} = await lookup(ticker, this.props.robinhood);
    this.setState({
      ticker,
      foundPrice: currentPrice
    });
    this.setBuyPrice(currentPrice);
    this.setTotalCost(currentPrice, this.state.numShares);
  }
  submit() {
    this.props.onNewPlay({
      ticker: this.state.ticker,
      buyPrice: this.state.buyPrice,
      highSell: this.state.highSell,
      lowSell: this.state.lowSell,
      numShares: this.state.numShares
    });
    this.setState(INITIAL_STATE);
  }
  render() {
    return (
      <form onSubmit={e => e.preventDefault()}>
        <table>
          <tbody>
            <tr>
              <td>Ticker</td>
              <td>
                <input type="text" onInput={(e) => this.getPrice(e.target.value)} autofocus />
              </td>
            </tr>
            <tr>
              <td>Current price:</td>
              <td>{this.state.foundPrice}</td>
            </tr>
            <tr>
              <td>Buy price:</td>
              <td>
                <input
                  type="text"
                  value={this.state.buyPrice}
                  onInput={(e) => this.setBuyPrice(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>Num Shares:</td>
              <td>
                <input
                  type="text"
                  value={this.state.numShares}
                  onInput={(e) => this.setNumShares(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>Total Cost:</td>
              <td>
                {this.state.totalCost}
              </td>
            </tr>
            <tr>
              <td>High Sell:</td>
              <td>
                <input
                  type="text"
                  value={this.state.highSell}
                  onInput={(e) => this.setHighSell(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>Lower Sell:</td>
              <td>
                <input
                  type="text"
                  value={this.state.lowSell}
                  onInput={(e) => this.setLowSell(e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button onClick={() => this.submit()} data-tclass="btn">Submit</button>
      </form>
    );
  }
}
