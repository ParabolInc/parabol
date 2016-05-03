import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import tinycolor from 'tinycolor2';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;
const progressDotColor = tinycolor.mix(theme.palette.d, '#fff', 50).toHexString();

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class ProgressDots extends Component {
  render() {
    return (
      <div className={styles.progressDotGroup}>
        <a className={combineStyles(styles.progressDot, styles.progressDotCurrent)} href="#">
          <span className={styles.progressDotLabel}>Step one</span>
        </a>
        <a className={styles.progressDot} href="#">
          <span className={styles.progressDotLabel}>Step two</span>
        </a>
        <a className={styles.progressDot} href="#">
          <span className={styles.progressDotLabel}>Step three</span>
        </a>
      </div>
    );
  }
}

styles = StyleSheet.create({
  progressDotGroup: {
    fontSize: 0,
    margin: '2rem 0 0',
    textAlign: 'center',
    width: '100%'
  },

  progressDot: {
    backgroundColor: 'transparent',
    border: `1px solid ${progressDotColor}`,
    borderRadius: '100%',
    display: 'inline-block',
    height: '.75rem',
    margin: '0 .375rem',
    width: '.75rem'
  },

  // NOTE: Same thang, diff. semantics (completed, current)
  progressDotCompleted: {
    backgroundColor: progressDotColor
  },
  progressDotCurrent: {
    backgroundColor: progressDotColor
  },

  progressDotLabel: {
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
