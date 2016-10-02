import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class SetupContent extends Component {
  static propTypes = {
    children: PropTypes.any
  };

  render() {
    return (
      <div className={styles.setupContent}>
        {this.props.children}
      </div>
    );
  }
}

const styleThunk = () => ({
  setupContent: {
    alignItems: 'center',
    // #shame forcing non-vendor prefix
    display: 'flex !important',
    flexDirection: 'column',
    justifyContent: 'center'
  }
});
