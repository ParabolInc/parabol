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

    const buttonStyleOptions = [
      styles.buttonBase
    ];

    const buttonSize = size || 'medium';
    const buttonStyle = style || 'solid';
    const buttonTheme = theme || 'dark';
    const buttonTitle = title || label;

    const buttonSizeCSS = styles[buttonSize];
    const buttonStyleCSS = styles[buttonStyle];

    let buttonIsOutlined = false;
    let buttonIsInverted = false;
    let buttonThemeCSS = styles.solidDark;

    if (style === 'outlined') {
      buttonIsOutlined = true;
    }

    if (style === 'inverted') {
      buttonIsInverted = true;
    }

    if (buttonTheme === 'cool') {
      if (buttonIsInverted) {
        buttonThemeCSS = styles.invertedCool;
      } else if (buttonIsOutlined) {
        buttonThemeCSS = styles.outlinedCool;
      } else {
        buttonThemeCSS = styles.solidCool;
      }
    } else if (buttonTheme === 'warm') {
      if (buttonIsInverted) {
        buttonThemeCSS = styles.invertedWarm;
      } else if (buttonIsOutlined) {
        buttonThemeCSS = styles.outlinedWarm;
      } else {
        buttonThemeCSS = styles.solidWarm;
      }
    } else if (buttonTheme === 'dark') {
      if (buttonIsInverted) {
        buttonThemeCSS = styles.invertedDark;
      } else if (buttonIsOutlined) {
        buttonThemeCSS = styles.outlinedDark;
      } else {
        buttonThemeCSS = styles.solidDark;
      }
    } else if (buttonTheme === 'mid') {
      if (buttonIsInverted) {
        buttonThemeCSS = styles.invertedMid;
      } else if (buttonIsOutlined) {
        buttonThemeCSS = styles.outlinedMid;
      } else {
        buttonThemeCSS = styles.solidMid;
      }
    } else if (buttonTheme === 'light') {
      if (buttonIsInverted) {
        buttonThemeCSS = styles.invertedLight;
      } else if (buttonIsOutlined) {
        buttonThemeCSS = styles.outlinedLight;
      } else {
        buttonThemeCSS = styles.solidLight;
      }
    } else if (buttonTheme === 'white') {
      if (buttonIsInverted) {
        buttonThemeCSS = styles.invertedWhite;
      } else if (buttonIsOutlined) {
        buttonThemeCSS = styles.outlinedWhite;
      } else {
        buttonThemeCSS = styles.solidWhite;
      }
    }

    buttonStyleOptions.push(
      buttonSizeCSS,
      buttonStyleCSS,
      buttonThemeCSS
    );

    const buttonStyles = combineStyles.apply(null, buttonStyleOptions);

    return (
      <button
        className={buttonStyles}
        onClick={onClick}
        title={buttonTitle}
      >
        {label}
      </button>
    );
  }
}

const makeSolidTheme = (color, textColor = '#fff') => ({
  backgroundColor: color,
  borderColor: color,
  color: textColor,

  ':hover': {
    color: textColor
  },
  ':focus': {
    color: textColor
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

const makeInvertedTheme = (color, textColor, opacity = '.65') => {
  const colorMix = tinycolor.mix(color, '#fff', 90).toHexString();
  const textColorMix = tinycolor.mix(textColor, '#000', 10).toHexString();

  return {
    backgroundColor: colorMix,
    borderColor: colorMix,
    color: textColorMix,

    ':hover': {
      color: textColorMix,
      opacity
    },
    ':focus': {
      color: textColorMix,
      opacity
    }
  };
};


const { cool, warm, dark, mid, light } = appTheme.palette;

styles = StyleSheet.create({
  // Button base
  buttonBase: {
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

  // TODO: Add “light” variant and “light” themes
  // TODO: Add white outlined theme

  // Solid buttons
  solid: {
    backgroundColor: dark,
    border: `1px solid ${dark}`,

    ':hover': {
      opacity: '.65'
    },
    ':focus': {
      opacity: '.65'
    }
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
    borderColor: 'currentColor',
    color: dark,
  },

  // Outlined button themes
  outlinedCool: makeOutlinedTheme(cool),
  outlinedWarm: makeOutlinedTheme(warm),
  outlinedDark: makeOutlinedTheme(dark),
  outlinedMid: makeOutlinedTheme(mid),
  outlinedLight: makeOutlinedTheme(light),
  outlinedWhite: makeOutlinedTheme('#fff'),

  // Inverted buttons
  inverted: {
    // Define
  },

  invertedCool: makeInvertedTheme(cool, cool),
  invertedWarm: makeInvertedTheme(warm, warm),
  invertedDark: makeInvertedTheme(dark, dark),
  invertedMid: makeInvertedTheme(mid, mid),
  invertedLight: makeInvertedTheme(light, dark),
  invertedWhite: makeInvertedTheme('#fff', dark)
});
