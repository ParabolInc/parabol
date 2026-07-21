import {forwardRef} from 'react'
import {Button, type ButtonProps} from '../ui/Button/Button'

const SIZE_MAP = {
  small: 'sm',
  medium: 'md',
  large: 'lg'
} as const

export interface SecondaryButtonProps extends Omit<ButtonProps, 'size' | 'variant'> {
  size?: keyof typeof SIZE_MAP
  waiting?: boolean
}

const SecondaryButton = forwardRef<HTMLButtonElement, SecondaryButtonProps>((props, ref) => {
  const {size = 'small', waiting, disabled, ...rest} = props
  return (
    <Button
      ref={ref}
      variant='outline'
      size={SIZE_MAP[size]}
      shape='pill'
      disabled={disabled || waiting}
      {...rest}
    />
  )
})

SecondaryButton.displayName = 'SecondaryButton'

export default SecondaryButton
