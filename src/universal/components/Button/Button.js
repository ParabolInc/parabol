import PropTypes from 'prop-types'
import React, {Component} from 'react'
import tinycolor from 'tinycolor2'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import styled from 'react-emotion'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'

const lightThemes = ['white', 'light', 'gray']
const flatStyles = ['flat', 'outlined']

const makeSolidTheme = (themeColor, color) => ({
  backgroundColor: themeColor,
  borderColor: themeColor,
  color,
  ':hover,:focus': {color}
})

const makeFlatTheme = (buttonStyle, color, colorPalette) => ({
  backgroundColor: 'transparent',
  borderColor: buttonStyle === 'flat' ? 'transparent' : 'currentColor',
  boxShadow: 'none',
  color,
  fontWeight: 400,
  ':hover,:focus': {
    backgroundColor: lightThemes.includes(colorPalette)
      ? 'rgba(0, 0, 0, .15)'
      : appTheme.palette.light,
    boxShadow: 'none',
    color
  }
})

const makeLinkTheme = (color) => ({
  backgroundColor: 'transparent',
  border: 0,
  boxShadow: 'none',
  color,
  fontWeight: 400,
  padding: 0,
  ':hover,:focus': {
    boxShadow: 'none',
    color: tinycolor.mix(color, '#000', 15).toHexString()
  }
})

const makePrimaryTheme = () => ({
  ...ui.buttonStylesPrimary
})

const makePropColors = (buttonStyle, colorPalette) => {
  const themeColor = ui.palette[colorPalette]
  const baseTextColor = ui.palette.white
  const textColor = lightThemes.includes(colorPalette) ? ui.palette.dark : baseTextColor
  if (flatStyles.includes(buttonStyle)) {
    return makeFlatTheme(buttonStyle, themeColor, colorPalette)
  }
  if (buttonStyle === 'primary') {
    return makePrimaryTheme()
  }
  if (buttonStyle === 'link') {
    return makeLinkTheme(themeColor)
  }
  return makeSolidTheme(themeColor, textColor)
}

const ButtonRoot = styled('button')(
  // Sets up base and sizing
  ({size}) => ({
    // ...ui.buttonBaseStyles,
    ...size,
    transition: `box-shadow ${ui.transition[0]}, transform ${ui.transition[0]}`
  }),
  // Handles depth prop
  ({depth, disabled}) =>
    depth && {
      boxShadow: ui.shadow[depth],
      ':hover,:focus,:active': {
        boxShadow: !disabled && ui.shadow[depth + 2]
      }
    },
  // Make it a block
  ({isBlock}) => isBlock && ui.buttonBlockStyles,
  // Add theme
  ({buttonStyle, colorPalette, disabled}) => ({
    ...makePropColors(buttonStyle, colorPalette),
    ':hover,:focus,:active': {
      backgroundColor: flatStyles.includes(buttonStyle) && disabled && 'transparent'
    }
  }),
  // Disabled
  ({disabled}) => disabled && ui.buttonDisabledStyles,
  // Pressed down
  ({pressedDown, depth}) =>
    pressedDown && {
      transform: 'translate(0, .125rem)',
      ':hover,:focus,:active': {
        boxShadow: (depth && ui.shadow[depth + 1]) || 'none'
      },
      ':disabled': {
        boxShadow: 'none'
      }
    },
  // Waiting
  ({waiting}) => waiting && {...ui.buttonDisabledStyles, cursor: 'wait'}
)

const ButtonInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center'
})

const ButtonLabel = styled('div')(({size: {fontSize, lineHeight}}) => ({
  fontSize,
  height: lineHeight,
  lineHeight,
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
    buttonSize: PropTypes.oneOf(ui.buttonSizeOptions),
    buttonStyle: PropTypes.oneOf(['flat', 'link', 'outlined', 'primary', 'solid']),
    colorPalette: PropTypes.oneOf(ui.paletteOptions),
    // depth: up to 2 + 2 (for :hover, :focus) = up to ui.shadow[4]
    depth: PropTypes.oneOf([0, 1, 2]),
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
        <React.Fragment>
          {iconOnly ? (
            makeIcon()
          ) : (
            <React.Fragment>
              {thisIconPlacement === 'left' && makeIcon()}
              <ButtonLabel size={buttonSizeStyles}>{label}</ButtonLabel>
              {thisIconPlacement === 'right' && makeIcon()}
            </React.Fragment>
          )}
        </React.Fragment>
      )
    }

    return (
      <ButtonRoot
        {...this.props}
        aria-label={ariaLabel}
        disabled={hasDisabledStyles || disabled || waiting}
        onClick={onClick}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseEnter={onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        pressedDown={!hasDisabledStyles && pressedDown}
        ref={innerRef}
        size={buttonSizeStyles}
        title={title || ariaLabel}
        type={type || 'button'}
        waiting={waiting}
      >
        <ButtonInner>
          {icon ? makeIconLabel() : <ButtonLabel size={buttonSizeStyles}>{label}</ButtonLabel>}
        </ButtonInner>
      </ButtonRoot>
    )
  }
}

export default Button
