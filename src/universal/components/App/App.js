import React, {PropTypes} from 'react';
import styles from './App.css';

export default function App(props) {
  return (
    <div className={styles.app}>
      {props.children}
    </div>
  );
}

App.propTypes = {
  children: PropTypes.any
};
