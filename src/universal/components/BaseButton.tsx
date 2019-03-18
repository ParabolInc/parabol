import React, {Component, ReactNode, Ref} from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import PlainButton, {PlainButtonProps} from 'universal/components/PlainButton/PlainButton'
import withInnerRef from 'universal/decorators/withInnerRef'
import elevation from 'universal/styles/elevation'

const isValidElevation = (elevation) => elevation >= 0 && elevation <= 24

const getPressedElevation = (elevation1, elevation2) => {
  const offset = Math.floor(Math.abs(elevation1 - elevation2) / 2)
  const hovered = Math.max(elevation1, elevation2)
  const pressedElevation = hovered ? hovered - offset : 0
  return elevation[pressedElevation]
}

const getBoxShadow = (disabled, pressedDown, desiredElevation, otherElevation) => {
  if (disabled || !isValidElevation(desiredElevation)) return undefined
  if (pressedDown) return getPressedElevation(desiredElevation, otherElevation)
  return elevation[desiredElevation]
}

interface Root {
  disabled: boolean
  elevationResting: number | undefined
  elevationHovered: number | undefined
  pressedDown: boolean
  size: 'small' | 'medium' | 'large'
}

const ButtonRoot = styled(PlainButton)(
  ({disabled, elevationResting, elevationHovered, pressedDown, size}: Root) => {
    return {
      // size is easy to override, it adds: fontSize, lineHeight, padding
      ...ui.buttonSizeStyles[size],
      alignItems: 'center',
      border: '.0625rem solid transparent',
      boxShadow: getBoxShadow(disabled, pressedDown, elevationResting, elevationHovered),
      display: 'flex',
      flexShrink: 0,
      justifyContent: 'center',
      textAlign: 'center',
      transition: `box-shadow ${ui.transition[0]}`,
      userSelect: 'none',
      whiteSpace: 'nowrap',
      ':hover,:focus,:active': {
        boxShadow: getBoxShadow(disabled, pressedDown, elevationHovered, elevationResting),
        outline: pressedDown && 0
      }
    }
  }
)

export interface BaseButtonProps extends PlainButtonProps {
  'aria-label'?: string
  size?: 'small' | 'medium' | 'large'
  children?: ReactNode
  className?: string
  elevationHovered?: number
  elevationResting?: number
  innerRef?: Ref<any>
  onClick?: React.MouseEventHandler
  onMouseEnter?: React.MouseEventHandler
  onMouseLeave?: React.MouseEventHandler
  style?: object
}

interface State {
  pressedDown: boolean
}

class BaseButton extends Component<BaseButtonProps, State> {
  state: State = {
    pressedDown: false
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
    const hasDisabledStyles = !!(disabled || waiting)

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
