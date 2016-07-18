import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import * as appTheme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;
const { cool, warm, dark, mid, light } = appTheme.palette;
const white = '#fff';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class Background extends Component {

  static propTypes = {
    align: PropTypes.oneOf([
      'left',
      'center',
      'right'
    ]),
    bold: PropTypes.bool,
    children: PropTypes.any,
    display: PropTypes.oneOf([
      'block',
      'inline',
      'inlineBlock'
    ]),
    family: PropTypes.oneOf([
      'sansSerif',
      'serif'
    ]),
    italic: PropTypes.bool,
    scale: PropTypes.oneOf([
      'sBase', // 16px
      's1',    // 12px
      's2',    // 13px
      's3',    // 14px
      's4',    // 18px
      's5',    // 20px
      's6',    // 24px
      's7',    // 36px
      's8',    // 48px
    ]),
    theme: PropTypes.oneOf([
      'cool',
      'warm',
      'dark',
      'mid',
      'light',
      'white'
    ]),
    width: PropTypes.oneOf([
      'auto',
      'full'
    ])
  }

  static defaultProps = {
    align: 'left',
    display: 'block',
    family: 'sansSerif',
    scale: 'sBase',
    style: 'normal',
    theme: 'dark',
    width: 'full'
  }

  render() {
    const {
      align,
      bold,
      children,
      display,
      family,
      italic,
      scale,
      theme,
      width
    } = this.props;

    const typeStyles = combineStyles(
      styles.base,
      styles[align],
      styles[bold],
      styles[display],
      styles[family],
      styles[scale],
      styles[theme],
      styles[italic],
      styles[width]
    );

    const boldStyles = bold ? styles.bold : null;
    const italicStyles = italic ? styles.italic : null;

    return (
      <div className={combineStyles(typeStyles, boldStyles, italicStyles)}>
        {children}
      </div>
    );
  }
}

styles = StyleSheet.create({
  // base
  base: {
    // Define
  },

  // align
  left: {
    textAlign: 'left'
  },

  center: {
    textAlign: 'center'
  },

  right: {
    textAlign: 'right'
  },

  // display
  block: {
    display: 'block'
  },

  inline: {
    display: 'inline'
  },

  inlineBlock: {
    display: 'inline-block'
  },

  // family
  sansSerif: {
    fontFamily: appTheme.typography.sansSerif
  },

  serif: {
    fontFamily: appTheme.typography.serif
  },

  // scale
  sBase: {
    fontSize: appTheme.typography.sBase
  },

  s1: {
    fontSize: appTheme.typography.s1
  },

  s2: {
    fontSize: appTheme.typography.s2
  },

  s3: {
    fontSize: appTheme.typography.s3
  },

  s4: {
    fontSize: appTheme.typography.s4
  },

  s5: {
    fontSize: appTheme.typography.s5
  },

  s6: {
    fontSize: appTheme.typography.s6
  },

  s7: {
    fontSize: appTheme.typography.s7
  },

  s8: {
    fontSize: appTheme.typography.s8
  },

  // style
  italic: {
    fontStyle: 'italic'
  },

  // theme
  cool: {
    color: cool
  },

  warm: {
    color: warm
  },

  dark: {
    color: dark
  },

  mid: {
    color: mid
  },

  light: {
    color: light
  },

  white: {
    color: white
  },

  // weight
  bold: {
    fontWeight: 700
  },

  // width
  auto: {
    width: 'auto'
  },

  full: {
    width: '100%'
  }
});
