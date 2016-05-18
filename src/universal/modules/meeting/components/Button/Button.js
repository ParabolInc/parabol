import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import * as appTheme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class Button extends Component {

  // Prop Options:
  // -------------
  // size: smallest, small, medium, large, largest
  // style: solid, outlined
  // theme: cool, warm, dark, mid, light

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
    let buttonThemeCSS = styles.solidDark;

    if (style === 'outlined') {
      buttonIsOutlined = true;
    }

    if (buttonTheme === 'cool') {
      buttonThemeCSS = buttonIsOutlined ? styles.outlinedCool : styles.solidCool;
    } else if (buttonTheme === 'warm') {
      buttonThemeCSS = buttonIsOutlined ? styles.outlinedWarm : styles.solidWarm;
    } else if (buttonTheme === 'dark') {
      buttonThemeCSS = buttonIsOutlined ? styles.outlinedDark : styles.solidDark;
    } else if (buttonTheme === 'mid') {
      buttonThemeCSS = buttonIsOutlined ? styles.outlinedMid : styles.solidMid;
    } else if (buttonTheme === 'light') {
      buttonThemeCSS = buttonIsOutlined ? styles.outlinedLight : styles.solidLight;
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

const makeSolidTheme = color => ({
  backgroundColor: color,
  borderColor: color
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
    color: '#fff',

    ':hover': {
      color: '#fff',
      opacity: '.65'
    },
    ':focus': {
      color: '#fff',
      opacity: '.65'
    }
  },

  // Button solid themes
  solidCool: makeSolidTheme(cool),
  solidWarm: makeSolidTheme(warm),
  solidDark: makeSolidTheme(dark),
  solidMid: makeSolidTheme(mid),
  solidLight: makeSolidTheme(light),

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
  outlinedLight: makeOutlinedTheme(light)
});
