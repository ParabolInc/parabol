import PropTypes from 'prop-types'
import React, {Component} from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import PlainButton from 'universal/components/PlainButton/PlainButton'

const ButtonRoot = styled(PlainButton)(({size, depth, disabled, pressedDown}) => {
  const hasDepth = depth || depth === 0
  const boxShadow = hasDepth ? ui.shadow[depth] : 'none'
  const hoverDepth = hasDepth ? ui.shadow[depth + 2] : ui.shadow[1]
  const pressedDepth = hasDepth ? ui.shadow[depth + 1] : ui.shadow[0]
  const stateDepth = pressedDown ? pressedDepth : hoverDepth
  return {
    // size is easy to override, it adds: fontSize, lineHeight, padding
    ...ui.buttonSizeStyles[size],
    display: 'block',
    border: '.0625rem solid transparent',
    boxShadow,
    textAlign: 'center',
    transform: pressedDown && 'translate(0, .125rem)',
    transition: `
        box-shadow ${ui.buttonTransition},
        transform ${ui.buttonTransition}
      `,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    ':hover,:focus,:active': {
      boxShadow: disabled ? 'none' : stateDepth,
      outline: pressedDown && 0
    }
  }
})

class BaseButton extends Component {
  static propTypes = {
    'aria-label': PropTypes.string,
    size: PropTypes.oneOf(ui.buttonSizeOptions),
    children: PropTypes.any,
    // handling className allows usage of emotion’s styled handler
    className: PropTypes.string,
    // depth: up to 2 + 2 (for :hover, :focus) = up to ui.shadow[4]
    depth: PropTypes.oneOf([0, 1, 2]),
    disabled: PropTypes.bool,
    innerRef: PropTypes.func,
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
      depth,
      disabled,
      innerRef,
      onClick,
      onMouseEnter,
      style,
      waiting
    } = this.props

    const {pressedDown} = this.state
    const hasDisabledStyles = disabled || waiting

    // spread props to allow for html attributes like type when needed
    return (
      <ButtonRoot
        {...this.props}
        aria-label={ariaLabel}
        size={size}
        className={className}
        depth={depth}
        disabled={hasDisabledStyles}
        onClick={onClick}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseEnter={onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        pressedDown={!hasDisabledStyles && pressedDown}
        ref={innerRef}
        style={style}
        waiting={waiting}
      >
        {children}
      </ButtonRoot>
    )
  }
}

export default BaseButton
