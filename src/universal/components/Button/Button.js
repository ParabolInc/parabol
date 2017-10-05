import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import tinycolor from 'tinycolor2';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import textOverflow from 'universal/styles/helpers/textOverflow';

const makeSolidTheme = (themeColor, textColor = '#fff', buttonStyle = 'solid') => {
  const buttonColor = buttonStyle === 'inverted' ? tinycolor.mix(themeColor, '#fff', 90).toHexString() : themeColor;
  const color = buttonStyle === 'inverted' ? tinycolor.mix(textColor, '#000', 10).toHexString() : textColor;

  return {
    backgroundColor: buttonColor,
    borderColor: buttonColor,
    color,

    ':hover': { color },
    ':focus': { color }
  };
};

const makeFlatTheme = (buttonStyle, color) => ({
  backgroundColor: 'transparent',
  borderColor: buttonStyle === 'flat' ? 'transparent' : 'currentColor',
  boxShadow: 'none !important',
  color,

  ':hover': {
    backgroundColor: appTheme.palette.mid10a,
    color
  },
  ':focus': {
    backgroundColor: appTheme.palette.mid10a,
    color
  }
});

const makePropColors = (buttonStyle, colorPalette) => {
  const color = ui.palette[colorPalette];
  const baseTextColor = buttonStyle === 'inverted' ? color : ui.palette.white;
  const textColor = (colorPalette === 'white' || colorPalette === 'light' || colorPalette === 'gray') ?
    ui.palette.dark : baseTextColor;
  if (buttonStyle === 'flat' || buttonStyle === 'outlined') {
    return makeFlatTheme(buttonStyle, color);
  }
  return makeSolidTheme(color, textColor, buttonStyle);
};

class Button extends Component {
  static propTypes = {
    'aria-label': PropTypes.string,
    colorPalette: PropTypes.oneOf(ui.paletteOptions),
    compact: PropTypes.bool,
    // depth: up to 3 + 1 (for :hover, :focus) = up to ui.shadow[4]
    depth: PropTypes.oneOf([0, 1, 2, 3]),
    disabled: PropTypes.bool,
    icon: PropTypes.string,
    iconPlacement: PropTypes.oneOf([
      'left',
      'right'
    ]),
    isBlock: PropTypes.bool,
    label: PropTypes.string,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    size: PropTypes.oneOf(ui.buttonSizes),
    buttonStyle: PropTypes.oneOf([
      'solid',
      'outlined',
      'inverted',
      'flat'
    ]),
    styles: PropTypes.object,
    textTransform: PropTypes.oneOf([
      'none',
      'uppercase'
    ]),
    title: PropTypes.string,
    type: PropTypes.oneOf([
      'button',
      'menu',
      'reset',
      'submit'
    ]),
    waiting: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      pressedDown: null
    };
  }

  onMouseDown = (e) => {
    if (e.button === 0) {
      this.setState({pressedDown: true});
    }
  }

  onMouseUp = (e) => {
    if (this.state.pressedDown) {
      this.setState({ pressedDown: false });
    }
    // We don’t want 'focus' styles to linger after the click (TA)
    e.currentTarget.blur();
  };

  onMouseLeave = () => {
    if (this.state.pressedDown) {
      this.setState({pressedDown: false});
    }
  }

  render() {
    const {
      'aria-label': ariaLabel,
      compact,
      depth,
      disabled,
      icon,
      iconPlacement,
      isBlock,
      label,
      onClick,
      onMouseEnter,
      size,
      styles,
      title,
      type,
      waiting
    } = this.props;

    const {pressedDown} = this.state;
    const iconOnly = !label;

    const buttonStyles = css(
      styles.base,
      depth && styles.depth,
      compact && styles.compact,
      isBlock && styles.isBlock,
      styles.propColors,
      disabled && styles.disabled,
      pressedDown && styles.pressedDown,
      waiting && styles.wait
    );

    const makeIconLabel = () => {
      const defaultIconPlacement = icon && label ? 'left' : '';
      const thisIconPlacement = iconPlacement || defaultIconPlacement;
      const iconStyle = {
        fontSize: ui.buttonIconSize[size] || ui.buttonIconSize.medium,
        lineHeight: 'inherit',
        verticalAlign: 'middle'
      };
      const iconPlacementStyle = css(
        thisIconPlacement === 'left' && styles.iconLeft,
        thisIconPlacement === 'right' && styles.iconRight,
      );
      const iconMargin = iconOnly ? '' : iconPlacementStyle;
      const makeIcon = () =>
        <FontAwesome className={iconMargin} name={icon} style={iconStyle} />;
      return (
        <span className={css(styles.buttonInner)}>
          {iconOnly ?
            makeIcon() :
            <span className={css(styles.buttonInner)}>
              {thisIconPlacement === 'left' && makeIcon()}
              <span className={css(styles.label)}>{label}</span>
              {thisIconPlacement === 'right' && makeIcon()}
            </span>
          }
        </span>
      );
    };

    return (
      <button
        className={buttonStyles}
        disabled={disabled || waiting}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseLeave}
        title={title || label}
        type={type || 'button'}
        aria-label={ariaLabel}
      >
        {icon ?
          makeIconLabel() :
          <span className={css(styles.buttonInner)}>
            <span className={css(styles.label)}>{label}</span>
          </span>
        }
      </button>
    );
  }
}

const styleThunk = (theme, {buttonStyle, colorPalette, depth, size, textTransform}) => ({
  // Button base
  base: {
    ...ui.buttonBaseStyles,
    borderRadius: ui.buttonBorderRadius,
    fontSize: ui.buttonFontSize[size] || ui.buttonFontSize.medium,
    lineHeight: ui.buttonLineHeight,
    padding: ui.buttonPadding[size] || ui.buttonPadding.medium,
    textTransform: textTransform || 'none',
    transition: `box-shadow ${ui.transition[0]}, transform ${ui.transition[0]}`
  },

  depth: {
    boxShadow: ui.shadow[depth],
    ':hover': {
      boxShadow: ui.shadow[depth + 1]
    },
    ':focus': {
      boxShadow: ui.shadow[depth + 1]
    }
  },

  isBlock: {
    ...ui.buttonBlockStyles
  },

  compact: {
    paddingLeft: ui.buttonPaddingHorizontalCompact,
    paddingRight: ui.buttonPaddingHorizontalCompact
  },

  // Variants
  // NOTE: Doing this saves us from creating 6*3 classes
  propColors: makePropColors(buttonStyle, colorPalette),

  // Disabled state
  disabled: {
    ...ui.buttonDisabledStyles
  },

  iconLeft: {
    marginRight: '.375em'
  },

  iconRight: {
    marginLeft: '.375em'
  },

  buttonInner: {
    display: 'block',
    fontSize: 0,
    whiteSpace: 'nowrap'
  },

  label: {
    ...textOverflow,
    display: 'inline-block',
    fontSize: ui.buttonFontSize[size] || ui.buttonFontSize.medium,
    height: ui.buttonLineHeight,
    lineHeight: ui.buttonLineHeight,
    maxWidth: '100%',
    verticalAlign: 'middle'
  },

  pressedDown: {
    transform: 'translate(0, .125rem)'
  },

  wait: {
    ...ui.buttonDisabledStyles,
    cursor: 'wait'
  }
});

export default withStyles(styleThunk)(Button);
