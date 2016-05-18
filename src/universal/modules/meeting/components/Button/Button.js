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

    let buttonSize = size || 'md';
    let buttonStyle = style || 'solid';
    let buttonTheme = theme || 'c';

    const buttonTitle = title || label;

    const getButtonSize = () => {
      switch (size) {
        case 'xs':
          buttonSize = styles.buttonSizeXs;
          return buttonSize;
        case 'sm':
          buttonSize = styles.buttonSizeSm;
          return buttonSize;
        case 'md':
          buttonSize = styles.buttonSizeMd;
          return buttonSize;
        case 'lg':
          buttonSize = styles.buttonSizeLg;
          return buttonSize;
        case 'xl':
          buttonSize = styles.buttonSizeXl;
          return buttonSize;
        default:
          buttonSize = styles.buttonSizeMd;
          return buttonSize;
      }
    };

    const getButtonStyle = () => {
      switch (style) {
        case 'solid':
          buttonStyle = styles.buttonSolid;
          return buttonStyle;
        case 'outlined':
          buttonStyle = styles.buttonOutlined;
          return buttonStyle;
        default:
          buttonStyle = styles.buttonSolid;
          return buttonStyle;
      }
    };

    const getButtonTheme = () => {
      switch (theme) {
        case 'a':
          if (style === 'outlined') {
            buttonTheme = styles.buttonOutlinedThemeA;
          } else {
            buttonTheme = styles.buttonSolidThemeA;
          }
          return buttonTheme;
        case 'b':
          if (style === 'outlined') {
            buttonTheme = styles.buttonOutlinedThemeB;
          } else {
            buttonTheme = styles.buttonSolidThemeB;
          }
          return buttonTheme;
        case 'c':
          if (style === 'outlined') {
            buttonTheme = styles.buttonOutlinedThemeC;
          } else {
            buttonTheme = styles.buttonSolidThemeC;
          }
          return buttonTheme;
        case 'd':
          if (style === 'outlined') {
            buttonTheme = styles.buttonOutlinedThemeD;
          } else {
            buttonTheme = styles.buttonSolidThemeD;
          }
          return buttonTheme;
        case 'e':
          if (style === 'outlined') {
            buttonTheme = styles.buttonOutlinedThemeE;
          } else {
            buttonTheme = styles.buttonSolidThemeE;
          }
          return buttonTheme;
        default:
          if (style === 'outlined') {
            buttonTheme = styles.buttonOutlinedThemeC;
          } else {
            buttonTheme = styles.buttonSolidThemeC;
          }
          return buttonTheme;
      }
    };

    buttonStyleOptions.push(
      getButtonSize(),
      getButtonStyle(),
      getButtonTheme()
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

// const buttonThemeNaming = [
//   {
//     name: 'A',
//     value: a
//   },
//   {
//     name: 'B',
//     value: b
//   },
//   {
//     name: 'C',
//     value: c
//   },
//   {
//     name: 'D',
//     value: d
//   },
//   {
//     name: 'E',
//     value: e
//   },
// ];
//
// const makeButtonTheme = (themeArray, className, callback) => ({
//   themeArray.map(i => ({
//     `${className}${i.name}`: callback(i.value)
//   });
// });

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
