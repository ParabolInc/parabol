import type * as React from 'react'
import {forwardRef, type ReactNode, type Ref, useState} from 'react'
import type {Elevation} from '../styles/elevation'
import {cn} from '../ui/cn'
import PlainButton, {type PlainButtonProps} from './PlainButton/PlainButton'

const SIZE_STYLES = {
  small: 'px-[1.5em] py-[5px] text-[14px] leading-5',
  medium: 'px-[1.5em] py-[7px] text-[15px] leading-6',
  large: 'px-[1.5em] py-[11px] text-[16px] leading-7'
} as const

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
    dataCy,
    ...rest
  } = props
  const hasDisabledStyles = !!(disabled || waiting)

  const [pressedDownState, setPressedDown] = useState(false)
  const pressedDown = !hasDisabledStyles && pressedDownState

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

  const restingShadow = hasDisabledStyles
    ? undefined
    : pressedDown
      ? elevationPressed
      : elevationResting
  const hoverShadow = hasDisabledStyles
    ? undefined
    : pressedDown
      ? elevationPressed
      : elevationHovered

  const styleWithShadows = {
    '--base-button-shadow': restingShadow,
    '--base-button-shadow-hover': hoverShadow,
    ...style
  } as React.CSSProperties

  return (
    <PlainButton
      {...rest}
      data-cy={dataCy}
      aria-label={ariaLabel}
      className={cn(
        'flex shrink-0 select-none items-center justify-center whitespace-nowrap border border-transparent text-center transition-shadow duration-100 ease-in',
        SIZE_STYLES[size],
        restingShadow && 'shadow-[var(--base-button-shadow)]',
        hoverShadow &&
          'hover:shadow-[var(--base-button-shadow-hover)] focus:shadow-[var(--base-button-shadow-hover)] active:shadow-[var(--base-button-shadow-hover)]',
        className
      )}
      disabled={hasDisabledStyles}
      ref={ref}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={styleWithShadows}
      waiting={waiting}
    >
      {children}
    </PlainButton>
  )
})

export default BaseButton
