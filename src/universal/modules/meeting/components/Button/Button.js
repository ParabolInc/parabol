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
  // theme: a, b, c, d, e

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
    let buttonTheme = theme || styles.buttonSolidThemeC;

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

    if (theme === 'a') {
      buttonTheme = buttonIsOutlined ? styles.buttonOutlinedThemeA : styles.buttonSolidThemeA;
    } else if (theme === 'b') {
      buttonTheme = buttonIsOutlined ? styles.buttonOutlinedThemeB : styles.buttonSolidThemeB;
    } else if (theme === 'c') {
      buttonTheme = buttonIsOutlined ? styles.buttonOutlinedThemeC : styles.buttonSolidThemeC;
    } else if (theme === 'd') {
      buttonTheme = buttonIsOutlined ? styles.buttonOutlinedThemeD : styles.buttonSolidThemeD;
    } else if (theme === 'e') {
      buttonTheme = buttonIsOutlined ? styles.buttonOutlinedThemeE : styles.buttonSolidThemeE;
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

const { a, b, c, d, e } = appTheme.palette;

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
    backgroundColor: c,
    border: `1px solid ${c}`,
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
  buttonSolidThemeA: makeButtonSolidTheme(a),
  buttonSolidThemeB: makeButtonSolidTheme(b),
  buttonSolidThemeC: makeButtonSolidTheme(c),
  buttonSolidThemeD: makeButtonSolidTheme(d),
  buttonSolidThemeE: makeButtonSolidTheme(e),

  // Outlined buttons
  buttonOutlined: {
    backgroundColor: 'transparent',
    borderColor: 'currentColor',
    color: c,
  },

  // Outlined button themes
  buttonOutlinedThemeA: makeButtonOutlinedTheme(a),
  buttonOutlinedThemeB: makeButtonOutlinedTheme(b),
  buttonOutlinedThemeC: makeButtonOutlinedTheme(c),
  buttonOutlinedThemeD: makeButtonOutlinedTheme(d),
  buttonOutlinedThemeE: makeButtonOutlinedTheme(e)
});
