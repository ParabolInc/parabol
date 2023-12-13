import React from 'react'
import {Slot} from '@radix-ui/react-slot'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'link' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'default'
type Shape = 'pill' | 'circle' | 'default'

const BASE_STYLES =
  'cursor-pointer inline-flex items-center justify-center whitespace-nowrap  transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'

// TODO: make sure the styles match the designs
const VARIANT_STYLES: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-tomato-600 to-rose-500 text-white font-semibold hover:opacity-90',
  destructive: 'bg-tomato-500 text-white font-semibold hover:bg-tomato-500/90',
  outline:
    'text-slate-900 border border-slate-400 hover:bg-slate-200 px-2.5 py-1 bg-transparent font-semibold',
  secondary: 'bg-sky-500 text-white hover:bg-sky-500/80 font-semibold',
  ghost: 'hover:opacity-80 bg-transparent font-semibold',
  link: 'text-primary underline-offset-4 hover:underline'
}

const SIZE_STYLES: Record<Size, string> = {
  default: '',
  sm: 'h-7 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-8 text-base'
}

const SHAPE_STYLES: Record<Shape, string> = {
  pill: 'rounded-full',
  circle: 'rounded-full aspect-square',
  default: ''
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant: Variant
  size?: Size
  shape?: Shape
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({className, variant, size = 'default', shape = 'default', asChild = false, ...props}, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={clsx(
          BASE_STYLES,
          VARIANT_STYLES[variant],
          size ? SIZE_STYLES[size] : null,
          SHAPE_STYLES[shape],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export {Button}
