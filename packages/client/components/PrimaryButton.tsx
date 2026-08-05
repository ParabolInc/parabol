import {forwardRef} from 'react'
import {Elevation} from '~/styles/elevation'
import {cn} from '../ui/cn'
import BaseButton, {type BaseButtonProps} from './BaseButton'

interface Props extends BaseButtonProps {}

const PrimaryButton = forwardRef((props: Props, ref: any) => {
  const {children, className, elevationHovered, elevationResting, ...rest} = props
  const {disabled, waiting} = rest
  const visuallyDisabled = disabled || waiting
  return (
    <BaseButton
      {...rest}
      ref={ref}
      className={cn(
        'rounded-md font-semibold text-white outline-none',
        visuallyDisabled
          ? 'bg-[linear-gradient(to_right,var(--color-tomato-400)_0,var(--color-rose-300)_100%)] opacity-100 hover:bg-[linear-gradient(to_right,var(--color-tomato-400)_0,var(--color-rose-300)_100%)] hover:opacity-100 focus:bg-[linear-gradient(to_right,var(--color-tomato-400)_0,var(--color-rose-300)_100%)] focus:opacity-100 active:bg-[linear-gradient(to_right,var(--color-tomato-400)_0,var(--color-rose-300)_100%)] active:opacity-100'
          : 'bg-[linear-gradient(to_right,var(--color-tomato-600)_0,var(--color-rose-500)_100%)] hover:bg-[linear-gradient(to_right,var(--color-tomato-700)_0,var(--color-rose-600)_100%)] focus:bg-[linear-gradient(to_right,var(--color-tomato-700)_0,var(--color-rose-600)_100%)] active:bg-[linear-gradient(to_right,var(--color-tomato-700)_0,var(--color-rose-600)_100%)]',
        className
      )}
      elevationHovered={elevationHovered || Elevation.Z8}
      elevationResting={elevationResting || Elevation.Z2}
      elevationPressed={elevationResting || Elevation.Z5}
    >
      {children}
    </BaseButton>
  )
})

export default PrimaryButton
