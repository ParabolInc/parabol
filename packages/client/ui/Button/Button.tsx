import {Slot} from '@radix-ui/react-slot'
import * as React from 'react'
import {cn} from '../cn'

type Variant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'ghost'
  | 'link'
  | 'outline'
  | 'flat'
  | 'raised'
  | 'dialogPrimary'
type Size = 'sm' | 'md' | 'lg' | 'default'
type Shape = 'icon' | 'default'

const BASE_STYLES =
  'inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md transition-colors focus-visible:outline-hidden focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50'

// TODO: make sure the styles match the designs
const VARIANT_STYLES: Record<Variant, string> = {
  primary: 'bg-linear-to-r from-tomato-600 to-rose-500 text-white font-semibold hover:opacity-90',
  destructive: 'bg-tomato-500 text-white font-semibold hover:bg-tomato-500/90',
  outline:
    'text-fg-primary border border-hairline-strong hover:bg-surface-hover px-2.5 py-1 bg-transparent font-semibold',
  dialogPrimary:
    'text-white bg-surface-cta hover:bg-surface-cta-hover focus-visible:ring-grape-500 font-semibold',
  secondary: 'bg-sky-500 text-white hover:bg-sky-500/80 font-semibold',
  ghost: 'hover:opacity-80 bg-transparent font-semibold',
  link: 'text-primary underline-offset-4 hover:underline',
  flat: 'bg-transparent outline-hidden shadow-none hover:bg-surface-hover focus:bg-surface-hover active:bg-surface-hover focus-visible:ring-0',
  raised:
    'font-semibold shadow-[0px_3px_1px_-2px_rgba(0,0,0,.2),0px_2px_2px_0px_rgba(0,0,0,.14),0px_1px_5px_0px_rgba(0,0,0,.12)] transition-[box-shadow,color,background-color] duration-100 ease-in hover:shadow-[0px_5px_5px_-3px_rgba(0,0,0,.2),0px_8px_10px_1px_rgba(0,0,0,.14),0px_3px_14px_2px_rgba(0,0,0,.12)] focus:shadow-[0px_5px_5px_-3px_rgba(0,0,0,.2),0px_8px_10px_1px_rgba(0,0,0,.14),0px_3px_14px_2px_rgba(0,0,0,.12)] active:shadow-[0px_5px_5px_-3px_rgba(0,0,0,.2),0px_8px_10px_1px_rgba(0,0,0,.14),0px_3px_14px_2px_rgba(0,0,0,.12)]'
}

const SIZE_STYLES: Record<Size, string> = {
  default: '',
  sm: 'h-7 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-8 text-base'
}

const SHAPE_STYLES: Record<Shape, string> = {
  icon: 'aspect-square',
  default: ''
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: Variant
  size?: Size
  shape?: Shape
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({className, variant, size = 'default', shape = 'default', asChild = false, ...props}, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(
          BASE_STYLES,
          variant ? VARIANT_STYLES[variant] : null,
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
