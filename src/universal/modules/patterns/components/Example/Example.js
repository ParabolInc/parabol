import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class Example extends Component {
  static propTypes = {
    children: PropTypes.any
  }

  render() {
    return (
      <div className={styles.base}>
        <h3 className={styles.heading}>Example</h3>
        <div className={styles.inner}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

const styleThunk = () => ({
  base: {
    margin: '2rem auto'
  },

  heading: {
    backgroundColor: '#999',
    color: 'white',
    fontSize: '.875rem',
    margin: 0,
    padding: '.5rem 1rem',
    textTransform: 'uppercase'
  },

  inner: {
    border: '1px solid #999',
    padding: '2rem'
  }
});
