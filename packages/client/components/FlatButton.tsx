// DEPRECATED use packages/client/ui/Button/Button.tsx with variant='flat'
import type * as React from 'react'
import {forwardRef, type ReactNode, type Ref} from 'react'
import {cn} from '../ui/cn'
import BaseButton, {type BaseButtonProps} from './BaseButton'

const paletteStyles = {
  warm: 'text-gold-500',
  mid: 'text-grape-700',
  dark: 'text-fg-primary',
  blue: 'text-sky-500'
} as const

export interface FlatButtonProps extends BaseButtonProps {
  size?: 'small' | 'medium' | 'large'
  children?: ReactNode
  disabled?: boolean
  onClick?: (e: React.MouseEvent) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  palette?: keyof typeof paletteStyles
  style?: object
  waiting?: boolean
}

const FlatButton = forwardRef((props: FlatButtonProps, ref: Ref<HTMLButtonElement>) => {
  const {palette = 'dark', className, children, ...rest} = props
  const {disabled, waiting} = rest
  const visuallyDisabled = disabled || waiting
  return (
    <BaseButton
      {...rest}
      ref={ref}
      className={cn(
        'rounded-md bg-transparent outline-none hover:shadow-none focus:shadow-none active:shadow-none',
        paletteStyles[palette],
        !visuallyDisabled &&
          'hover:bg-surface-hover focus:bg-surface-hover active:bg-surface-hover',
        className
      )}
    >
      {children}
    </BaseButton>
  )
})

export default FlatButton
