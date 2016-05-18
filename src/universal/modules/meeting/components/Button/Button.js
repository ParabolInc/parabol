import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import * as appTheme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class Button extends Component {

  // Prop Options:
  // size: xs, sm, md, lg, xl
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

    const buttonTitle = title || label;

    let buttonSize = size || styles.buttonSizeMd;
    let buttonStyle = style || styles.buttonSolid;
    let buttonTheme = theme || styles.buttonSolidThemeDark;

    let buttonIsOutlined = false;

    if (style === 'outlined') {
      buttonIsOutlined = true;
    }

    if (size === 'xs') {
      buttonSize = styles.buttonSizeXs;
    } else if (size === 'sm') {
      buttonSize = styles.buttonSizeSm;
    } else if (size === 'md') {
      buttonSize = styles.buttonSizeMd;
    } else if (size === 'lg') {
      buttonSize = styles.buttonSizeLg;
    } else if (size === 'xl') {
      buttonSize = styles.buttonSizeXl;
    }

    if (style === 'solid') {
      buttonStyle = styles.buttonSolid;
    } else if (style === 'outlined') {
      buttonStyle = styles.buttonOutlined;
    }

    if (theme === 'cool') {
      buttonTheme = buttonIsOutlined ? styles.buttonOutlinedThemeCool : styles.buttonSolidThemeCool;
    } else if (theme === 'warm') {
      buttonTheme = buttonIsOutlined ? styles.buttonOutlinedThemeWarm : styles.buttonSolidThemeWarm;
    } else if (theme === 'dark') {
      buttonTheme = buttonIsOutlined ? styles.buttonOutlinedThemeDark : styles.buttonSolidThemeDark;
    } else if (theme === 'mid') {
      buttonTheme = buttonIsOutlined ? styles.buttonOutlinedThemeMid : styles.buttonSolidThemeMid;
    } else if (theme === 'light') {
      buttonTheme = buttonIsOutlined ? styles.buttonOutlinedThemeLigh : styles.buttonSolidThemeLigh;
    }

    buttonStyleOptions.push(
      buttonSize,
      buttonStyle,
      buttonTheme
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

const makeButtonSolidTheme = color => ({
  backgroundColor: color,
  borderColor: color
});

const makeButtonOutlinedTheme = (color, opacity = '.5') => ({
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

  // Solid buttons
  buttonSolid: {
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

  // Button sizes
  buttonSizeXs: {
    fontSize: '.75rem'
  },
  buttonSizeSm: {
    fontSize: '.875rem'
  },
  buttonSizeMd: {
    fontSize: '1rem'
  },
  buttonSizeLg: {
    fontSize: '1.125rem'
  },
  buttonSizeXl: {
    fontSize: '1.25rem'
  },

  // TODO: Add “light” variant and “light” themes
  // TODO: Add white outlined theme

  // Button solid themes
  buttonSolidThemeCool: makeButtonSolidTheme(cool),
  buttonSolidThemeWarm: makeButtonSolidTheme(warm),
  buttonSolidThemeDark: makeButtonSolidTheme(dark),
  buttonSolidThemeMid: makeButtonSolidTheme(mid),
  buttonSolidThemeLigh: makeButtonSolidTheme(light),

  // Outlined buttons
  buttonOutlined: {
    backgroundColor: 'transparent',
    borderColor: 'currentColor',
    color: dark,
  },

  // Outlined button themes
  buttonOutlinedThemeCool: makeButtonOutlinedTheme(cool),
  buttonOutlinedThemeWarm: makeButtonOutlinedTheme(warm),
  buttonOutlinedThemeDark: makeButtonOutlinedTheme(dark),
  buttonOutlinedThemeMid: makeButtonOutlinedTheme(mid),
  buttonOutlinedThemeLigh: makeButtonOutlinedTheme(light)
});
