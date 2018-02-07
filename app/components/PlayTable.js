import React, { Component } from 'react';

export default ({ activePlays }) => (

  <table>
    <tbody>
      <tr>
        <td>activePlays</td>
      </tr>
      <tr>
        <td><pre>{JSON.stringify(activePlays, null, 2)}</pre></td>
      </tr>
    </tbody>
  </table>

);
