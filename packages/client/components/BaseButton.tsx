import React, {forwardRef, ReactNode, Ref, useState} from 'react'
import styled from '@emotion/styled'
import ui from '../styles/ui'
import PlainButton, {PlainButtonProps} from './PlainButton/PlainButton'
import elevation from '../styles/elevation'

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

const ButtonRoot = styled(PlainButton)<Root>(
  ({disabled, elevationResting, elevationHovered, pressedDown, size}) => {
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
      transition: `box-shadow 100ms ease-in`,
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
  onClick?: React.MouseEventHandler
  onMouseDown?: React.MouseEventHandler
  onMouseEnter?: React.MouseEventHandler
  onMouseLeave?: React.MouseEventHandler
  style?: object
}

const BaseButton = forwardRef((props: BaseButtonProps, ref: Ref<HTMLButtonElement>) => {
  const {
    onMouseDown, onMouseLeave, 'aria-label': ariaLabel,
    size = 'small',
    children,
    className,
    disabled,
    elevationHovered,
    elevationResting,
    onClick,
    onMouseEnter,
    style,
    waiting
  } = props
  const hasDisabledStyles = !!(disabled || waiting)

  const [pressedDown, setPressedDown] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setPressedDown((true))
    }
    onMouseDown && onMouseDown(e)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    setPressedDown(false)
    // We don’t want 'focus' styles to linger after the click (TA)
    // wait till next tick because other components might need to use the button as the relativeTarget when they get blurred
    // pull the target out of the event so react can recycle the event
    const {currentTarget} = e
    setTimeout(() => (currentTarget as HTMLElement).blur())
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    setPressedDown(false)
    onMouseLeave && onMouseLeave(e)
  }

  // spread props to allow for html attributes like type when needed
  return (
    <ButtonRoot
      {...props}
      aria-label={ariaLabel}
      className={className}
      disabled={hasDisabledStyles}
      elevationHovered={elevationHovered}
      elevationResting={elevationResting}
      ref={ref}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleMouseLeave}
      pressedDown={!hasDisabledStyles && pressedDown}
      size={size}
      style={style}
      waiting={waiting}
    >
      {children}
    </ButtonRoot>
  )
})

export default BaseButton
