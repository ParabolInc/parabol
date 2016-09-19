import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import * as appTheme from 'universal/styles/theme';
import tinycolor from 'tinycolor2';
import upperFirst from 'universal/utils/upperFirst';

const combineStyles = StyleSheet.combineStyles;
const { cool, warm, dark, mid, light } = appTheme.palette;

const makeSolidTheme = (themeColor, textColor = '#fff', style = 'solid', opacity = '.65') => {
  let buttonColor = themeColor;
  let color = textColor;

  if (style === 'inverted') {
    buttonColor = tinycolor.mix(themeColor, '#fff', 90).toHexString();
    color = tinycolor.mix(textColor, '#000', 10).toHexString();
  }

  return {
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
  };
};

const makeOutlinedTheme = (color, opacity = '.5') => ({
  backgroundColor: 'transparent',
  borderColor: 'currentColor',
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

let keyframesDip = {};
let styles = {};

const Button = props => {
  const {
    disabled,
    isBlock,
    label,
    onClick,
    size,
    style,
    theme,
    title,
    type
  } = props;

  let buttonStyles = styles.base;
  const buttonTitle = title || label;
  const themeName = upperFirst(theme);
  const styleThemeName = `${style}${themeName}`;
  const buttonOptions = [styles.base, styles[size], styles[styleThemeName]];

  if (disabled) {
    buttonOptions.push(styles.disabled);
  }

  if (isBlock) {
    buttonOptions.push(styles.isBlock);
  }

  buttonStyles = combineStyles.apply(null, buttonOptions);

  return (
    <button
      className={buttonStyles}
      disabled={disabled}
      onClick={onClick}
      title={buttonTitle}
      type={type}
    >
      {label}
    </button>
  );
};

Button.propTypes = {
  disabled: PropTypes.bool,
  isBlock: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.oneOf([
    'smallest',
    'small',
    'medium',
    'large',
    'largest'
  ]),
  style: PropTypes.oneOf([
    'solid',
    'outlined',
    'inverted'
  ]),
  theme: PropTypes.oneOf([
    'cool',
    'warm',
    'dark',
    'mid',
    'light',
    'white'
  ]),
  title: PropTypes.string,
  type: PropTypes.oneOf([
    'button',
    'menu',
    'submit',
    'reset'
  ])
};

Button.defaultProps = {
  isBlock: false,
  label: 'Label Me',
  size: 'medium',
  style: 'solid',
  theme: 'dark',
  type: 'button'
};

keyframesDip = StyleSheet.keyframes({
  '0%': {
    transform: 'translate(0, 0)'
  },
  '50%': {
    transform: 'translate(0, .25rem)'
  },
  '100%': {
    transform: 'translate(0)'
  }
});

styles = StyleSheet.create({
  // Button base
  base: {
    border: '1px solid transparent',
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: 'normal',
    outline: 'none',
    padding: '1em 2em',
    textAlign: 'center',
    textDecoration: 'none',
    textTransform: 'uppercase',
    userSelect: 'none',

    ':hover': {
      textDecoration: 'none'
    },
    ':focus': {
      textDecoration: 'none'
    },

    ':active': {
      animationDuration: '.1s',
      animationName: keyframesDip,
      animationTimingFunction: 'ease-in'
    }
  },

  isBlock: {
    display: 'block',
    width: '100%'
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

  // Outlined button themes
  outlinedCool: makeOutlinedTheme(cool),
  outlinedWarm: makeOutlinedTheme(warm),
  outlinedDark: makeOutlinedTheme(dark),
  outlinedMid: makeOutlinedTheme(mid),
  outlinedLight: makeOutlinedTheme(light),
  outlinedWhite: makeOutlinedTheme('#fff'),

  // Inverted button themes
  invertedCool: makeSolidTheme(cool, cool, 'inverted'),
  invertedWarm: makeSolidTheme(warm, warm, 'inverted'),
  invertedDark: makeSolidTheme(dark, dark, 'inverted'),
  invertedMid: makeSolidTheme(mid, mid, 'inverted'),
  invertedLight: makeSolidTheme(light, dark, 'inverted'),
  invertedWhite: makeSolidTheme('#fff', dark, 'inverted'),

  // Disabled state
  disabled: {
    cursor: 'not-allowed',
    opacity: '.5',

    ':hover': {
      opacity: '.5'
    },
    ':focus': {
      opacity: '.5'
    },

    ':active': {
      animation: 'none'
    }
  }
});

export default look(Button);
