import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import tinycolor from 'tinycolor2';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';
import textOverflow from 'universal/styles/helpers/textOverflow';

const styleThunk = (theme, props) => ({
  // Button base
  base: {
    ...ui.buttonBaseStyles,
    borderRadius: ui.buttonBorderRadius,
    fontSize: ui.buttonFontSize[props.size] || ui.buttonFontSize.medium,
    lineHeight: ui.buttonLineHeight,
    padding: ui.buttonPadding[props.size] || ui.buttonPadding.medium,
    textTransform: props.textTransform || 'none'
  },

  isBlock: {
    ...ui.buttonBlockStyles
  },

  compact: {
    paddingLeft: ui.buttonPaddingHorizontalCompact,
    paddingRight: ui.buttonPaddingHorizontalCompact
  },

  sansPaddingX: {
    paddingLeft: 0,
    paddingRight: 0
  },

  raised: {
    boxShadow: '0 2px 4px rgba(0, 0, 0, .3)'
  },

  // Variants
  // NOTE: Doing this saves us from creating 6*3 classes
  propColors: makePropColors(props.buttonStyle, props.colorPalette),

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
    fontSize: ui.buttonFontSize[props.size] || ui.buttonFontSize.medium,
    height: ui.buttonLineHeight,
    lineHeight: ui.buttonLineHeight,
    maxWidth: '100%',
    verticalAlign: 'middle'
  },

  hasMouseDown: {
    transform: 'translate(0, .125rem)'
  }
});

const makeSolidTheme = (themeColor, textColor = '#fff', buttonStyle = 'solid', opacity = '.65') => {
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

const makeFlatTheme = (buttonStyle, color, opacity = '.5') => ({
  backgroundColor: 'transparent',
  borderColor: buttonStyle === 'flat' ? 'transparent' : 'currentColor',
  boxShadow: 'none !important',
  color,

  ':hover': { color },
  ':focus': { color }
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

// Look out, we have state! But no lifecycle methods, just DOM events for UI. :) (TA)

@withStyles(styleThunk)
export default class LabeledFieldArray extends Component {
  static propTypes = {
    colorPalette: PropTypes.oneOf(ui.paletteOptions),
    compact: PropTypes.bool,
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
    raised: PropTypes.bool,
    sansPaddingX: PropTypes.bool,
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
    ])
  };

  constructor(props) {
    super(props);
    this.state = {
      hasMouseDown: null
    };
  }

  onMouseDown = () => this.setState({ hasMouseDown: true });

  onMouseUp = (e) => {
    this.setState({ hasMouseDown: false });
    // We don’t want 'focus' styles to linger after the click (TA)
    e.currentTarget.blur();
  }

  render() {
    const {
      compact,
      disabled,
      icon,
      iconPlacement,
      isBlock,
      label,
      onClick,
      onMouseEnter,
      raised,
      sansPaddingX,
      size,
      styles,
      title,
      type
    } = this.props;

    const {hasMouseDown} = this.state;
    const iconOnly = !label;

    const buttonStyles = css(
      styles.base,
      raised && styles.raised,
      compact && styles.compact,
      sansPaddingX && styles.sansPaddingX,
      isBlock && styles.isBlock,
      styles.propColors,
      disabled && styles.disabled,
      hasMouseDown && styles.hasMouseDown
    );

    const makeIconLabel = () => {
      const defaultIconPlacement = icon && label ? 'left' : '';
      const thisIconPlacement = iconPlacement || defaultIconPlacement;
      const iconPlacementStyle = css(
        thisIconPlacement === 'left' && styles.iconLeft,
        thisIconPlacement === 'right' && styles.iconRight,
      );
      const iconMargin = iconOnly ? '' : iconPlacementStyle;
      const iconStyle = {
        fontSize: ui.buttonIconSize[size],
        lineHeight: 'inherit',
        verticalAlign: 'middle'
      };
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
        disabled={disabled}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        title={title || label}
        type={type || 'button'}
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
};
