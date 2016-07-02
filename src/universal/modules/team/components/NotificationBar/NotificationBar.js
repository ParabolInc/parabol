import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class NotificationBar extends Component {

  static propTypes = {
    children: PropTypes.any
  }

  render() {
    return (
      <div className={styles.bar}>
        {this.props.children}
      </div>
    );
  }
}

styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.palette.warm,
    color: '#fff',
    fontWeight: 700,
    padding: '1rem',
    textAlign: 'center'
  }
});
