import {forwardRef, type Ref} from 'react'
import {cn} from '../ui/cn'
import BaseButton, {type BaseButtonProps} from './BaseButton'

const CardButton = forwardRef((props: BaseButtonProps, ref: Ref<HTMLButtonElement>) => {
  const {className, children, ...rest} = props
  return (
    <BaseButton
      {...rest}
      ref={ref}
      className={cn(
        'flex h-6 min-w-6 items-center justify-center rounded-md p-0 text-fg-primary leading-5 opacity-50 outline-none hover:bg-surface-hover hover:opacity-100 focus:bg-surface-hover focus:opacity-100',
        className
      )}
    >
      {children}
    </BaseButton>
  )
})

export default CardButton
