import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class DashHeader extends Component {

  static propTypes = {
    meta: PropTypes.string,
    title: PropTypes.string,
  }

  render() {
    return (
      <div className={styles.header}>
        <div className={styles.title}>{this.props.title}</div>
        <div className={styles.meta}>{this.props.meta}</div>
      </div>
    );
  }
}

styles = StyleSheet.create({
  header: {
    borderBottom: '2px solid rgba(0, 0, 0, .10)',
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '4.875rem',
    padding: '1rem',
    width: '100%'
  },

  title: {
    fontSize: theme.typography.s5
  },

  meta: {
    color: theme.palette.dark70l,
    fontSize: theme.typography.s2,
    marginTop: '.125rem'
  }
});
