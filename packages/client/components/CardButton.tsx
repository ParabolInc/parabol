import {forwardRef, type Ref} from 'react'
import {Button, type ButtonProps} from '../ui/Button/Button'
import {cn} from '../ui/cn'

const CardButton = forwardRef((props: ButtonProps, ref: Ref<HTMLButtonElement>) => {
  const {className, children, ...rest} = props
  return (
    <Button
      {...rest}
      ref={ref}
      size='default'
      className={cn(
        'flex h-6 min-w-6 items-center justify-center rounded-md p-0 text-fg-primary leading-5 opacity-50 outline-none hover:bg-surface-hover hover:opacity-100 focus:bg-surface-hover focus:opacity-100',
        className
      )}
    >
      {children}
    </Button>
  )
})

export default CardButton
