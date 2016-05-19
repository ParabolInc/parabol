import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import * as appTheme from 'universal/styles/theme';
import tinycolor from 'tinycolor2';

const combineStyles = StyleSheet.combineStyles;

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class Button extends Component {

  // Prop Options:
  // -------------
  // size: smallest, small, medium, large, largest
  // style: solid, outlined, inverted
  // theme: cool, warm, dark, mid, light, white

  static propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func,
    size: PropTypes.string,
    style: PropTypes.string,
    theme: PropTypes.string,
    title: PropTypes.string
  }

  render() {
    const {
      label,
      onClick,
      size,
      style,
      theme,
      title
    } = this.props;

    const buttonStyleOptions = [styles.base];
    const buttonSize = size || 'medium';
    const buttonTitle = title || label;
    const buttonSizeCSS = styles[buttonSize];

    const solidCSS = {};
    solidCSS.cool = styles.solidCool;
    solidCSS.warm = styles.solidWarm;
    solidCSS.dark = styles.solidDark;
    solidCSS.mid = styles.solidMid;
    solidCSS.light = styles.solidLight;
    solidCSS.white = styles.solidWhite;

    const outlinedCSS = {};
    outlinedCSS.cool = styles.outlinedCool;
    outlinedCSS.warm = styles.outlinedWarm;
    outlinedCSS.dark = styles.outlinedDark;
    outlinedCSS.mid = styles.outlinedMid;
    outlinedCSS.light = styles.outlinedLight;
    outlinedCSS.white = styles.outlinedWhite;

    const invertedCSS = {};
    invertedCSS.cool = styles.invertedCool;
    invertedCSS.warm = styles.invertedWarm;
    invertedCSS.dark = styles.invertedDark;
    invertedCSS.mid = styles.invertedMid;
    invertedCSS.light = styles.invertedLight;
    invertedCSS.white = styles.invertedWhite;

    let buttonThemeCSS = styles.solidDark;

    if (style === 'solid') {
      buttonStyleOptions.push(styles[style]);
      buttonThemeCSS = solidCSS[theme];
    }

    if (style === 'outlined') {
      buttonStyleOptions.push(styles[style]);
      buttonThemeCSS = outlinedCSS[theme];
    }

    if (style === 'inverted') {
      buttonThemeCSS = invertedCSS[theme];
    }

    buttonStyleOptions.push(buttonSizeCSS, buttonThemeCSS);

    const buttonStyles = combineStyles.apply(null, buttonStyleOptions);

    return (
      <button className={buttonStyles} onClick={onClick} title={buttonTitle}>
        {label}
      </button>
    );
  }
}

const makeSolidTheme = (buttonColor, color = '#fff', opacity = '.65') => ({
  backgroundColor: buttonColor,
  borderColor: buttonColor,
  color,

  ':hover': {
    color,
    opacity
  },
  ':focus': {
    color,
    opacity
  }
});

const makeOutlinedTheme = (color, opacity = '.5') => ({
  color,

  ':hover': {
    color,
    opacity
  },
  ':focus': {
    color,
    opacity
  }
});

const makeInvertedTheme = (buttonColor, color, opacity = '.65') => {
  const buttonColorMix = tinycolor.mix(buttonColor, '#fff', 90).toHexString();
  const colorMix = tinycolor.mix(color, '#000', 10).toHexString();

  return {
    backgroundColor: buttonColorMix,
    borderColor: buttonColorMix,
    color: colorMix,

    ':hover': {
      color: colorMix,
      opacity
    },
    ':focus': {
      color: colorMix,
      opacity
    }
  };
};

const { cool, warm, dark, mid, light } = appTheme.palette;

styles = StyleSheet.create({
  // Button base
  base: {
    border: '1px solid transparent',
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: 'normal',
    padding: '1em 2em',
    textAlign: 'center',
    textDecoration: 'none',
    textTransform: 'uppercase',

    ':hover': {
      textDecoration: 'none'
    },
    ':focus': {
      textDecoration: 'none'
    }
  },

  // Button sizes
  smallest: {
    fontSize: '.75rem'
  },
  small: {
    fontSize: '.875rem'
  },
  medium: {
    fontSize: '1rem'
  },
  large: {
    fontSize: '1.125rem'
  },
  largest: {
    fontSize: '1.25rem'
  },

  // Button solid themes
  solidCool: makeSolidTheme(cool),
  solidWarm: makeSolidTheme(warm),
  solidDark: makeSolidTheme(dark),
  solidMid: makeSolidTheme(mid),
  solidLight: makeSolidTheme(light, dark),
  solidWhite: makeSolidTheme('#fff', dark),

  // Outlined buttons
  outlined: {
    backgroundColor: 'transparent',
    borderColor: 'currentColor'
  },

  // Outlined button themes
  outlinedCool: makeOutlinedTheme(cool),
  outlinedWarm: makeOutlinedTheme(warm),
  outlinedDark: makeOutlinedTheme(dark),
  outlinedMid: makeOutlinedTheme(mid),
  outlinedLight: makeOutlinedTheme(light),
  outlinedWhite: makeOutlinedTheme('#fff'),

  // Inverted button themes
  invertedCool: makeInvertedTheme(cool, cool),
  invertedWarm: makeInvertedTheme(warm, warm),
  invertedDark: makeInvertedTheme(dark, dark),
  invertedMid: makeInvertedTheme(mid, mid),
  invertedLight: makeInvertedTheme(light, dark),
  invertedWhite: makeInvertedTheme('#fff', dark)
});
