import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import tinycolor from 'tinycolor2';
import t from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;
const makeHoverColor = (color) =>
  tinycolor(color).darken(15).toString();

let s = {};

const keyframesDip = StyleSheet.keyframes({
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

const IconLink = (props) => {
  const {
    disabled,
    href,
    icon,
    iconPlacement,
    label,
    marginBottom,
    marginTop,
  } = props;

  const handleClick = (e) => {
    e.preventDefault();
    props.onClick(disabled);
  };

  // TODO: Change scope of StyleSheet.create() (TA)

  const iconBlock = () => {
    let marginStyle = {};

    if (iconPlacement === 'right') {
      marginStyle = {
        margin: '-.125rem 0 0 .5rem'
      };
    } else {
      marginStyle = {
        margin: '-.125rem .5rem 0 0'
      };
    }

    return (
      <FontAwesome className={s.icon} name={icon} style={marginStyle} />
    );
  };

  const rootStyle = {
    marginBottom,
    marginTop
  };
  const disabledStyles = combineStyles(s.root, s.disabled);
  const styles = disabled ? disabledStyles : s.root;

  return (
    <a
      className={styles}
      href={href}
      onClick={(e) => handleClick(e)}
      style={rootStyle}
      title={label}
    >
      {iconPlacement === 'left' && iconBlock()}
      {label}
      {iconPlacement === 'right' && iconBlock()}
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
  },
  scale: 'small',
  theme: 'cool'
};

export default look(IconLink);

s = StyleSheet.create({
  // TODO: remove functions from styles (TA)
  root: {
    color: (props) => t.palette[props.theme],
    cursor: 'pointer',
    display: 'inline-block',
    fontFamily: t.typography.serif,
    fontSize: (props) => (props.scale === 'small' ? t.typography.s3 : t.typography.s5),
    fontStyle: 'italic',
    fontWeight: 700,
    textDecoration: 'none',
    userSelect: 'none',

    ':hover': {
      color: (props) => makeHoverColor(t.palette[props.theme]),
      textDecoration: 'none'
    },
    ':focus': {
      color: (props) => makeHoverColor(t.palette[props.theme]),
      textDecoration: 'none'
    },

    ':active': {
      animationDuration: '.1s',
      animationName: keyframesDip,
      animationTimingFunction: 'ease-in'
    }
  },

  disabled: {
    color: (props) => t.palette[props.theme],
    cursor: 'not-allowed',
    opacity: '.5',

    ':hover': {
      color: (props) => t.palette[props.theme]
    },
    ':focus': {
      color: (props) => t.palette[props.theme]
    }
  },

  icon: {
    color: 'inherit',
    display: 'inline-block !important',
    fontSize: (props) => `${props.scale === 'small' ? '14px' : '28px'} !important`,
    verticalAlign: 'middle'
  }
});
