import {type ButtonHTMLAttributes, forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'

export interface PlainButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean
  waiting?: boolean
}

const PlainButton = forwardRef((props: PlainButtonProps, ref: Ref<HTMLButtonElement>) => {
  const {className, disabled, waiting, ...rest} = props
  return (
    <button
      {...rest}
      ref={ref}
      disabled={disabled}
      className={cn(
        'm-0 cursor-pointer appearance-none rounded-none border-0 bg-inherit p-0 text-[length:inherit] text-inherit outline-none [font-family:inherit] [text-align:inherit]',
        (disabled || waiting) &&
          'cursor-not-allowed opacity-50 hover:opacity-50 hover:shadow-none focus:opacity-50 focus:shadow-none active:animate-none active:shadow-none disabled:shadow-none',
        waiting && 'cursor-wait',
        className
      )}
    />
  )
})

export default PlainButton
