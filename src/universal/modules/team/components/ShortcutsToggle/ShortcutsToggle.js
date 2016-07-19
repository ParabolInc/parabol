import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import FontAwesome from 'react-fontawesome';
import theme from 'universal/styles/theme';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class ShortcutsToggle extends Component {
  static propTypes = {
    onClick: PropTypes.func
  }

  render() {
    const { onClick } = this.props;

    return (
      <a className={styles.shortcutsToggle} href="#" onClick={onClick} title="Show shortcuts">
        <FontAwesome name="keyboard-o" />
        &nbsp;
        <FontAwesome name="question-circle" />
        <span className={styles.shortcutsToggleLabel}>Show shortcuts</span>
      </a>
    );
  }
}

styles = StyleSheet.create({
  shortcutsToggle: {
    backgroundColor: theme.palette.dark10l,
    borderRadius: '4em',
    bottom: '2rem',
    color: theme.palette.dark50d,
    fontSize: theme.typography.s3,
    display: 'inline-block',
    padding: '.25rem .75rem',
    position: 'fixed',
    right: '2rem',

    // NOTE: ':hover' and ':focus' are the same
    ':hover': {
      backgroundColor: theme.palette.dark30l,
      color: theme.palette.dark10d,
      textDecoration: 'none'
    },
    ':focus': {
      backgroundColor: theme.palette.dark30l,
      color: theme.palette.dark10d,
      textDecoration: 'none'
    }
  },

  shortcutsToggleLabel: {
    // TODO: Make mixin for Sass: @include sr-only;
    border: 0,
    clip: 'rect(0, 0, 0, 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px'
  }
});
