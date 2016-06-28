import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';
import tinycolor from 'tinycolor2';

const backgroundColor = tinycolor.mix(theme.palette.mid10l, '#fff', 50).toHexString();
let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class DashContent extends Component {

  static propTypes = {
    children: PropTypes.any
  }

  render() {
    return (
      <div className={styles.root}>
        {this.props.children}
      </div>
    );
  }
}

styles = StyleSheet.create({
  root: {
    backgroundColor,
    flex: 1,
    padding: '1rem',
    width: '100%'
  }
});
