import styled from '@emotion/styled'
import React, {forwardRef, ReactNode, Ref, useState} from 'react'
import {Elevation} from '../styles/elevation'
import ui from '../styles/ui'
import PlainButton, {PlainButtonProps} from './PlainButton/PlainButton'

interface Root {
  disabled: boolean
  elevationResting: Elevation | undefined
  elevationHovered: Elevation | undefined
  elevationPressed: Elevation | undefined
  pressedDown: boolean
  size: 'small' | 'medium' | 'large'
}

const ButtonRoot = styled(PlainButton)<Root>(
  ({disabled, elevationResting, elevationHovered, elevationPressed, pressedDown, size}) => {
    return {
      // size is easy to override, it adds: fontSize, lineHeight, padding
      ...(ui.buttonSizeStyles[size] as any),
      alignItems: 'center',
      border: '1px solid transparent',
      boxShadow: disabled ? undefined : pressedDown ? elevationPressed : elevationResting,
      display: 'flex',
      flexShrink: 0,
      justifyContent: 'center',
      textAlign: 'center',
      transition: `box-shadow 100ms ease-in`,
      userSelect: 'none',
      whiteSpace: 'nowrap',
      ':hover,:focus,:active': {
        boxShadow: disabled ? undefined : pressedDown ? elevationPressed : elevationHovered,
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
  dataCy?: string
  elevationHovered?: Elevation
  elevationResting?: Elevation
  elevationPressed?: Elevation
  onClick?: React.MouseEventHandler
  onMouseDown?: React.MouseEventHandler
  onMouseEnter?: React.MouseEventHandler
  onMouseLeave?: React.MouseEventHandler
  style?: object
}

const BaseButton = forwardRef((props: BaseButtonProps, ref: Ref<HTMLButtonElement>) => {
  const {
    onMouseDown,
    onMouseLeave,
    'aria-label': ariaLabel,
    size = 'small',
    children,
    className,
    disabled,
    elevationHovered,
    elevationResting,
    elevationPressed,
    onClick,
    onMouseEnter,
    style,
    waiting,
    dataCy
  } = props
  const hasDisabledStyles = !!(disabled || waiting)

  const [pressedDown, setPressedDown] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setPressedDown(true)
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
      data-cy={dataCy}
      aria-label={ariaLabel}
      className={className}
      disabled={hasDisabledStyles}
      elevationHovered={elevationHovered}
      elevationResting={elevationResting}
      elevationPressed={elevationPressed}
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
