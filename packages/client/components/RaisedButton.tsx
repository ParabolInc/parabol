import {forwardRef, type Ref} from 'react'
import {Elevation} from '../styles/elevation'
import {cn} from '../ui/cn'
import BaseButton, {type BaseButtonProps} from './BaseButton'

const paletteStyles = {
  gray: 'bg-slate-200 text-slate-700',
  warm: 'bg-gold-500 text-white',
  pink: 'bg-rose-500 text-white',
  mid: 'bg-grape-700 text-white',
  dark: 'bg-slate-700 text-white',
  blue: 'bg-sky-500 text-white',
  white: 'bg-white text-slate-700'
} as const

export interface RaisedButtonProps extends BaseButtonProps {
  palette?: keyof typeof paletteStyles
}

const RaisedButton = forwardRef((props: RaisedButtonProps, ref: Ref<HTMLButtonElement>) => {
  const {
    children,
    className,
    elevationPressed,
    elevationHovered,
    elevationResting,
    palette = 'gray',
    ...rest
  } = props
  return (
    <BaseButton
      {...rest}
      className={cn('rounded-md font-semibold outline-none', paletteStyles[palette], className)}
      elevationHovered={elevationHovered || Elevation.Z8}
      elevationResting={elevationResting || Elevation.Z2}
      elevationPressed={elevationPressed || Elevation.Z5}
      ref={ref}
    >
      {children}
    </BaseButton>
  )
})

export default RaisedButton
