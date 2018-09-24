import PropTypes from 'prop-types'
import React, {Component} from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import withInnerRef from 'universal/decorators/withInnerRef'
import elevation from 'universal/styles/elevation'

const ButtonRoot = styled(PlainButton)(
  ({disabled, elevationResting, elevationHovered, pressedDown, size}) => {
    const hasDepth = elevationResting && elevationHovered
    return {
      // size is easy to override, it adds: fontSize, lineHeight, padding
      ...ui.buttonSizeStyles[size],
      alignItems: 'center',
      border: '.0625rem solid transparent',
      boxShadow: !disabled && hasDepth ? elevation[elevationResting] : undefined,
      display: 'flex',
      justifyContent: 'center',
      textAlign: 'center',
      transition: `box-shadow ${ui.transition[0]}`,
      userSelect: 'none',
      whiteSpace: 'nowrap',
      ':hover,:focus,:active': {
        boxShadow: !disabled && hasDepth ? elevation[elevationHovered] : undefined,
        outline: pressedDown && 0
      }
    }
  },
  ({disabled, elevationHovered, elevationResting, pressedDown}) => {
    const pressedDownElevation = elevationHovered - (elevationHovered - elevationResting) / 2
    const boxShadow = !disabled && pressedDown ? elevation[pressedDownElevation] : undefined
    return {
      boxShadow,
      ':hover,:focus,:active': {
        boxShadow,
        outline: pressedDown && 0
      }
    }
  }
)

class BaseButton extends Component {
  static propTypes = {
    'aria-label': PropTypes.string,
    size: PropTypes.oneOf(ui.buttonSizeOptions),
    children: PropTypes.any,
    // handling className allows usage of emotion’s styled handler
    className: PropTypes.string,
    disabled: PropTypes.bool,
    // elevation values 0 - 24
    elevationHovered: PropTypes.number,
    elevationResting: PropTypes.number,
    innerRef: PropTypes.any,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    style: PropTypes.object,
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
      size = 'small',
      children,
      className,
      disabled,
      elevationHovered,
      elevationResting,
      innerRef,
      onClick,
      onMouseEnter,
      style,
      waiting
    } = this.props

    const {pressedDown} = this.state
    const hasDisabledStyles = disabled || waiting

    console.log(`elevationHovered: ${elevationHovered}`)
    console.log(`elevationResting: ${elevationResting}`)

    // spread props to allow for html attributes like type when needed
    return (
      <ButtonRoot
        {...this.props}
        aria-label={ariaLabel}
        className={className}
        disabled={hasDisabledStyles}
        elevationHovered={elevationHovered}
        elevationResting={elevationResting}
        innerRef={innerRef}
        onClick={onClick}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseEnter={onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        pressedDown={!hasDisabledStyles && pressedDown}
        size={size}
        style={style}
        waiting={waiting}
      >
        {children}
      </ButtonRoot>
    )
  }
}

export default withInnerRef(BaseButton)
