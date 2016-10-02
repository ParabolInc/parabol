import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import FontAwesome from 'react-fontawesome';
import tinycolor from 'tinycolor2';
import appTheme from 'universal/styles/theme/appTheme';

const IconLink = (props) => {
  const {
    disabled,
    href,
    icon,
    iconPlacement,
    label,
    marginBottom,
    marginTop,
    onClick,
    styles
  } = props;

  // TODO understand this. whatup with passing in disabled? This normally expects an event
  const handleClick = (e) => {
    e.preventDefault();
    onClick(disabled);
  };

  const inlineStyle = {
    marginBottom,
    marginTop
  };

  const rootStyles = css(
    styles.root,
    disabled && styles.disabled
  );
  const iconStyles = css(
    styles.icon,
    iconPlacement === 'left' ? styles.placeLeft : styles.placeRight
  );

  return (
    <a
      className={rootStyles}
      href={href}
      onClick={handleClick}
      style={inlineStyle}
      title={label}
    >
      {iconPlacement === 'left' && <FontAwesome className={iconStyles} name={icon}/>}
      {label}
      {iconPlacement === 'right' && <FontAwesome className={iconStyles} name={icon}/>}
    </a>
  );
};

IconLink.propTypes = {
  disabled: PropTypes.bool,
  href: PropTypes.string,
  icon: PropTypes.string,
  iconPlacement: PropTypes.oneOf([
    'left',
    'right'
  ]),
  label: PropTypes.string,
  marginBottom: PropTypes.string,
  marginTop: PropTypes.string,
  onClick: PropTypes.func,
  scale: PropTypes.oneOf([
    'small',
    'large'
  ]),
  theme: PropTypes.oneOf([
    'cool',
    'dark',
    'mid',
    'warm'
  ])
};

IconLink.defaultProps = {
  disabled: false,
  icon: 'check',
  iconPlacement: 'left',
  label: 'prop.label',
  marginBottom: '0px',
  marginTop: '2rem',
  onClick(disabled) {
    console.log(`IconLink onClick, disabled? ${disabled}`);
  }
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
const makeHoverColor = (color) => tinycolor(color).darken(15).toString();

const styleThunk = (customTheme, {colorPalette, scale}) => {
  const computeOnceColor = appTheme.palette[colorPalette];
  const darkenedComputedColor = makeHoverColor(computeOnceColor);
  return {
    root: {
      color: computeOnceColor,
      cursor: 'pointer',
      display: 'inline-block',
      fontFamily: t.typography.serif,
      fontSize: scale === 'small' ? appTheme.typography.s3 : appTheme.typography.s5,
      fontStyle: 'italic',
      fontWeight: 700,
      textDecoration: 'none',
      userSelect: 'none',
      ':hover': {
        color: darkenedComputedColor,
        textDecoration: 'none'
      },
      ':focus': {
        color: darkenedComputedColor,
        textDecoration: 'none'
      },

      ':active': {
        animationDuration: '.1s',
        animationName: keyframesDip,
        animationTimingFunction: 'ease-in'
      }
    },

    disabled: {
      color: computeOnceColor,
      cursor: 'not-allowed',
      opacity: '.5',

      ':hover': {
        color: computeOnceColor
      },
      ':focus': {
        color: computeOnceColor
      }
    },

    icon: {
      color: 'inherit',
      display: 'inline-block !important',
      fontSize: `${props.scale === 'small' ? '14px' : '28px'} !important`,
      verticalAlign: 'middle'
    },

    placeRight: {
      margin: '-.125rem 0 0 .5rem'
    },

    placeLeft: {
      margin: '-.125rem .5rem 0 0'
    }
  }
};

export default withStyles(styleThunk)(IconLink);
