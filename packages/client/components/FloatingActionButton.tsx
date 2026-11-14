import {forwardRef, type Ref} from 'react'
import {Button, type ButtonProps} from '../ui/Button/Button'
import {cn} from '../ui/cn'

const paletteStyles = {
  gray: 'bg-slate-200 text-slate-700',
  warm: 'bg-gold-500 text-white',
  pink: 'bg-rose-500 text-white',
  mid: 'bg-grape-700 text-white',
  dark: 'bg-slate-700 text-white',
  blue: 'bg-sky-500 text-white',
  white: 'bg-white text-slate-700'
} as const

interface Props extends ButtonProps {
  palette?: keyof typeof paletteStyles
}

const FloatingActionButton = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {children, className, palette = 'gray', ...rest} = props
  return (
    <Button
      variant='raised'
      size='default'
      className={cn(paletteStyles[palette], className)}
      ref={ref}
      {...rest}
    >
      {children}
    </Button>
  )
})

export default FloatingActionButton
