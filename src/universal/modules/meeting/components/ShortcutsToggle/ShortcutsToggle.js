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
    // backgroundColor: mix($theme-c, #fff, 10%),
    backgroundColor: theme.palette.tuBgC10o.bg,
    borderRadius: '4em',
    // color: mix($theme-c, #000, 50%),
    bottom: '2rem',
    color: theme.palette.tuColorC50d.color,
    fontSize: theme.typography.fs3,
    display: 'inline-block',
    padding: '.25rem .75rem',
    position: 'fixed',
    right: '2rem',

    // NOTE: ':hover' and ':focus' are the same
    //       The clouds and the bushes,
    //       they are the same: https://vimeo.com/10449855
    ':hover': {
      // backgroundColor: mix($theme-c, #fff, 30%),
      backgroundColor: theme.palette.tuBgC30o.bg,
      // color: mix($theme-c, #000, 10%),
      color: theme.palette.tuColorC10d.color,
      textDecoration: 'none'
    },
    ':focus': {
      // backgroundColor: mix($theme-c, #fff, 30%),
      backgroundColor: theme.palette.tuBgC30o.bg,
      // color: mix($theme-c, #000, 10%),
      color: theme.palette.tuColorC10d.color,
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
