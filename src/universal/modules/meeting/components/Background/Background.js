import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import * as appTheme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class Background extends Component {

  // Prop Options:
  // -------------
  // align: left, center, right
  // theme: cool, warm, dark, mid, light, white
  // width: auto, full

  static propTypes = {
    align: PropTypes.string,
    children: PropTypes.any,
    theme: PropTypes.string,
    width: PropTypes.string
  }

  render() {
    const { align, children, theme, width } = this.props;

    const alignCSS = align || 'left';
    const themeCSS = theme || 'dark';
    const widthCSS = width || 'auto';
    const backgroundStyles = combineStyles(
      styles.base,
      styles[alignCSS],
      styles[themeCSS],
      styles[widthCSS]
    );

    return (
      <div className={backgroundStyles}>
        {children}
      </div>
    );
  }
}

const { cool, warm, dark, mid, light } = appTheme.palette;
const white = '#fff';
const padding = '2rem';

styles = StyleSheet.create({
  // base
  base: {
    padding
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

  // theme
  cool: {
    backgroundColor: cool
  },

  warm: {
    backgroundColor: warm
  },

  dark: {
    backgroundColor: dark
  },

  mid: {
    backgroundColor: mid
  },

  light: {
    backgroundColor: light
  },

  white: {
    backgroundColor: white
  },

  // width
  auto: {
    width: 'auto'
  },

  full: {
    width: '100%'
  }
});
