import {forwardRef} from 'react'
import {Button, type ButtonProps} from '../ui/Button/Button'
import {cn} from '../ui/cn'

const SIZE_MAP = {
  small: 'sm',
  medium: 'md',
  large: 'lg'
} as const

export interface OutlinedButtonProps extends Omit<ButtonProps, 'size' | 'variant'> {
  size?: keyof typeof SIZE_MAP
  waiting?: boolean
}

const OutlinedButton = forwardRef<HTMLButtonElement, OutlinedButtonProps>((props, ref) => {
  const {size = 'small', waiting, disabled, className, children, ...rest} = props
  return (
    <Button
      {...rest}
      ref={ref}
      variant='flat'
      size={SIZE_MAP[size]}
      disabled={disabled || waiting}
      className={cn('border border-current', className)}
    >
      {children}
    </Button>
  )
})

OutlinedButton.displayName = 'OutlinedButton'

export default OutlinedButton
