import React, { Component } from 'react';
import styles from './Modal.css';

export default ({ title, children, onCancel }) => (

  <div>
      <div className={styles.background} />
      <div className={styles.modal} >
        <h1>{title}</h1>
        {children}
        <button onClick={() => onCancel()}>Cancel</button>
      </div>
  </div>

);
