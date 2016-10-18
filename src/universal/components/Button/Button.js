import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import tinycolor from 'tinycolor2';

const {dark} = appTheme.palette;
const white = '#fff';

const makeSolidTheme = (themeColor, textColor = '#fff', style = 'solid', opacity = '.65') => {
  const buttonColor = style === 'inverted' ? tinycolor.mix(themeColor, '#fff', 90).toHexString() : themeColor;
  const color = style === 'inverted' ? tinycolor.mix(textColor, '#000', 10).toHexString() : textColor;

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

const makePropColors = (style, colorPalette) => {
  const color = appTheme.palette[colorPalette] || white;
  if (style === 'outlined') {
    return makeOutlinedTheme(color);
  }
  const baseTextColor = style === 'inverted' ? color : white;
  const textColor = (colorPalette === 'white' || colorPalette === 'light') ? dark : baseTextColor;
  return makeSolidTheme(color, textColor, style);
};

const Button = (props) => {
  const {
    disabled,
    isBlock,
    label,
    onClick,
    size,
    styles,
    title,
    type
  } = props;

  const buttonTitle = title || label;

  const buttonStyles = css(
    styles.base,
    styles[size],
    styles.propColors,
    disabled && styles.disabled,
    isBlock && styles.isBlock
  );

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
  styles: PropTypes.object,
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

const keyframesDip = {
  '0%': {
    transform: 'translate(0, 0)'
  },
  '50%': {
    transform: 'translate(0, .25rem)'
  },
  '100%': {
    transform: 'translate(0)'
  }
};

const styleThunk = (customTheme, props) => ({
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

  // doing this saves us from creating 6*3 classes
  propColors: makePropColors(props.style, props.colorPalette),

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

export default withStyles(styleThunk)(Button);
