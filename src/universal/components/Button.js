import PropTypes from 'prop-types'
import React, {Component} from 'react'
import tinycolor from 'tinycolor2'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import styled from 'react-emotion'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'

const makeSolidTheme = (themeColor, color = '#fff', buttonStyle = 'solid') => ({
  backgroundColor: themeColor,
  borderColor: themeColor,
  color,
  ':hover,:focus': {color}
})

const makeFlatTheme = (buttonStyle, color) => ({
  backgroundColor: 'transparent',
  borderColor: buttonStyle === 'flat' ? 'transparent' : 'currentColor',
  boxShadow: 'none !important',
  color,
  fontWeight: 400,
  ':hover,:focus': {
    backgroundColor: appTheme.palette.light,
    boxShadow: 'none',
    color
  }
})

const makeLinkTheme = (color) => ({
  backgroundColor: 'transparent',
  boxShadow: 'none !important',
  color,
  fontWeight: 400,
  paddingLeft: 0,
  paddingRight: 0,
  ':hover,:focus': {
    boxShadow: 'none !important',
    color: tinycolor.mix(color, '#000', 15).toHexString()
  }
})

const makePrimaryTheme = () => ({
  ...ui.buttonStylesPrimary
})

const makePropColors = (buttonStyle, colorPalette) => {
  const color = ui.palette[colorPalette]
  const baseTextColor = ui.palette.white
  const textColor =
    colorPalette === 'white' || colorPalette === 'light' || colorPalette === 'gray'
      ? ui.palette.dark
      : baseTextColor
  if (buttonStyle === 'flat' || buttonStyle === 'outlined') {
    return makeFlatTheme(buttonStyle, color)
  }
  if (buttonStyle === 'primary') {
    return makePrimaryTheme()
  }
  if (buttonStyle === 'link') {
    return makeLinkTheme(color)
  }
  return makeSolidTheme(color, textColor, buttonStyle)
}

const ButtonRoot = styled('button')(
  ({size}) => ({
    ...ui.buttonBaseStyles,
    ...size,
    transition: `box-shadow ${ui.transition[0]}, transform ${ui.transition[0]}`
  }),
  ({depth, disabled}) =>
    depth && {
      boxShadow: ui.shadow[depth],
      ':hover,:focus,:active': {
        boxShadow: !disabled && ui.shadow[depth + 1]
      }
    },
  ({isBlock}) => isBlock && ui.buttonBlockStyles,
  ({buttonStyle, colorPalette, disabled}) => ({
    ...makePropColors(buttonStyle, colorPalette),
    ':hover,:focus,:active': {
      backgroundColor: disabled && 'transparent'
    }
  }),
  ({disabled}) => disabled && ui.buttonDisabledStyles,
  ({pressedDown, depth}) =>
    pressedDown && {
      transform: 'translate(0, .125rem)',
      ':hover,:focus,:active': {
        boxShadow: (depth && ui.shadow[depth]) || 'none'
      },
      ':disabled': {
        boxShadow: 'none'
      }
    },
  ({waiting}) => waiting && {...ui.buttonDisabledStyles, cursor: 'wait'}
)

const ButtonInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center'
})

const ButtonLabel = styled('div')(({size}) => ({
  fontSize: size.fontSize,
  height: size.lineHeight,
  lineHeight: size.lineHeight,
  maxWidth: '100%',
  whiteSpace: 'nowrap'
}))

const ButtonIcon = styled(StyledFontAwesome)(
  ({iconLarge, iconMargin, iconPalette, iconPlacement}) => ({
    color: iconPalette ? ui.palette[iconPalette] : 'inherit',
    display: 'block',
    fontSize: iconLarge ? ui.iconSize2x : ui.iconSize,
    lineHeight: 'inherit',
    marginLeft: iconPlacement === 'right' && '.5rem',
    marginRight: iconPlacement === 'left' && '.5rem'
  })
)

class Button extends Component {
  static propTypes = {
    'aria-label': PropTypes.string,
    colorPalette: PropTypes.oneOf(ui.paletteOptions),
    // depth: up to 3 + 1 (for :hover, :focus) = up to ui.shadow[4]
    depth: PropTypes.oneOf([0, 1, 2, 3]),
    disabled: PropTypes.bool,
    icon: PropTypes.string,
    iconLarge: PropTypes.bool,
    iconPalette: PropTypes.oneOf(ui.paletteOptions),
    iconPlacement: PropTypes.oneOf(['left', 'right']),
    innerRef: PropTypes.func,
    isBlock: PropTypes.bool,
    label: PropTypes.any,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    buttonSize: PropTypes.oneOf(ui.buttonSizeOptions),
    buttonStyle: PropTypes.oneOf(['flat', 'link', 'outlined', 'primary', 'solid']),
    styles: PropTypes.object,
    title: PropTypes.string,
    type: PropTypes.oneOf(['button', 'menu', 'reset', 'submit']),
    // https://github.com/facebook/react/issues/4251
    visuallyDisabled: PropTypes.bool,
    waiting: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this.state = {
      pressedDown: null
    }
  }

  onMouseDown = (e) => {
    if (e.button === 0) {
      this.setState({pressedDown: true})
    }
  }

  onMouseUp = (e) => {
    if (this.state.pressedDown) {
      this.setState({pressedDown: false})
    }
    // We don’t want 'focus' styles to linger after the click (TA)
    // wait till next tick because other components might need to use the button as the relativeTarget when they get blurred
    // pull the target out of the event so react can recycle the event
    const {currentTarget} = e
    setTimeout(() => currentTarget.blur())
  }

  onMouseLeave = (e) => {
    if (this.state.pressedDown) {
      this.setState({pressedDown: false})
    }
    const {onMouseLeave} = this.props
    if (onMouseLeave) {
      onMouseLeave(e)
    }
  }

  render () {
    const {
      'aria-label': ariaLabel,
      buttonSize,
      disabled,
      icon,
      iconLarge,
      iconPalette,
      iconPlacement,
      innerRef,
      label,
      onClick,
      onMouseEnter,
      title,
      type,
      visuallyDisabled,
      waiting
    } = this.props

    const {pressedDown} = this.state
    const iconOnly = !label
    const hasDisabledStyles = Boolean(disabled || visuallyDisabled)

    const size = buttonSize || ui.buttonSizeOptions[1]
    const buttonSizeStyles = ui.buttonSizeStyles[size]

    const makeIconLabel = () => {
      const defaultIconPlacement = icon && label ? 'left' : ''
      const thisIconPlacement = iconPlacement || defaultIconPlacement
      const makeIcon = () => (
        <ButtonIcon
          iconLarge={iconLarge}
          iconPalette={iconPalette}
          iconPlacement={!iconOnly && thisIconPlacement}
          name={icon}
        />
      )
      return (
        <ButtonInner>
          {iconOnly ? (
            makeIcon()
          ) : (
            <ButtonInner>
              {thisIconPlacement === 'left' && makeIcon()}
              <ButtonLabel size={buttonSizeStyles}>{label}</ButtonLabel>
              {thisIconPlacement === 'right' && makeIcon()}
            </ButtonInner>
          )}
        </ButtonInner>
      )
    }

    return (
      <ButtonRoot
        {...this.props}
        aria-label={ariaLabel}
        disabled={hasDisabledStyles || disabled || waiting}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseLeave}
        pressedDown={!hasDisabledStyles && pressedDown}
        ref={innerRef}
        size={buttonSizeStyles}
        title={title || ariaLabel}
        type={type || 'button'}
        waiting={waiting}
      >
        {icon ? (
          makeIconLabel()
        ) : (
          <ButtonInner>
            <ButtonLabel size={buttonSizeStyles}>{label}</ButtonLabel>
          </ButtonInner>
        )}
      </ButtonRoot>
    )
  }
}

export default Button
