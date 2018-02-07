import React, { Component } from 'react';
import getTrend from '../backend/utils/get-trend';
import styles from './CurrentPositions.css';

export default ({ positions }) => (

  <table width='100%'>
    <thead>
        <tr>
            <th>Symbol</th>
            <th>Pricing</th>
            <th>Trend</th>
            <th>Quantity</th>
            <th>Overall Value</th>
        </tr>
    </thead>
    <tbody>
      {positions && positions.map(position => (
          <tr key={position.symbol}>
              <td><b>{position.symbol}</b></td>
              <td>
                bought @: {position.average_buy_price} <br/>
                current: {position.currentPrice} <br/>
              </td>
              <td className={
                (position.currentPrice > position.average_buy_price) ? 
                    styles.wentup : styles.wentdown
              }>
                <b>{getTrend(position.currentPrice, position.average_buy_price)}</b>
              </td>
              <td>{Math.round(position.quantity)}</td>
              <td>${position.overallValue}</td>
          </tr>
      ))}
    </tbody>
  </table>

);
