import {forwardRef, type Ref} from 'react'
import {cn} from '../ui/cn'
import BaseButton, {type BaseButtonProps} from './BaseButton'

const paletteStyles = {
  blue: 'text-sky-500',
  dark: 'text-fg-primary',
  gray: 'text-slate-200',
  midGray: 'text-fg-secondary',
  red: 'text-tomato-600',
  warm: 'text-gold-500',
  white: 'text-white'
} as const

const hoverPaletteStyles = {
  blue: 'hover:text-sky-600 focus:text-sky-600 active:text-sky-600',
  dark: 'hover:text-accent focus:text-accent active:text-accent',
  gray: 'hover:text-slate-400 focus:text-slate-400 active:text-slate-400',
  midGray: 'hover:text-fg-primary focus:text-fg-primary active:text-fg-primary',
  red: 'hover:text-tomato-800 focus:text-tomato-800 active:text-tomato-800',
  warm: 'hover:text-gold-700 focus:text-gold-700 active:text-gold-700',
  white: 'hover:text-slate-300 focus:text-slate-300 active:text-slate-300'
} as const

export interface LinkButtonProps extends BaseButtonProps {
  palette?: keyof typeof paletteStyles
}

const LinkButton = forwardRef((props: LinkButtonProps, ref: Ref<HTMLButtonElement>) => {
  const {palette = 'dark', className, children, ...rest} = props
  const {disabled, waiting} = rest
  const visuallyDisabled = disabled || waiting
  return (
    <BaseButton
      {...rest}
      ref={ref}
      className={cn(
        'border-0 bg-transparent p-0 shadow-none hover:shadow-none focus:shadow-none active:shadow-none',
        paletteStyles[palette],
        !visuallyDisabled && hoverPaletteStyles[palette],
        className
      )}
    >
      {children}
    </BaseButton>
  )
})

export default LinkButton
