import React, { Component } from 'react';
import styles from './TableObj.css';

export default ({ obj, ...rest }) => (

  <table className={styles.table} >
    <tbody>
      {obj && Object.keys(obj).map(key => (
          <tr key={key}>
              <td>{key}</td>
              <td>{obj[key]}</td>
          </tr>
      ))}
    </tbody>
  </table>

);
