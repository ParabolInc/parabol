import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../ui/cn'

interface Props extends ComponentPropsWithoutRef<'div'> {
  hasError: boolean
}

const UpgradeCreditCardFormFieldBlock = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {className, children, hasError, ...rest} = props
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center rounded-[4px] border border-hairline-field [&_input]:w-full [&_input]:appearance-none [&_input]:rounded-[4px] [&_input]:border-0 [&_input]:bg-surface-input [&_input]:px-2 [&_input]:py-[7px] [&_input]:text-[15px] [&_input]:text-fg-primary [&_input]:leading-6 [&_input]:shadow-none [&_input]:outline-none',
        hasError && '[&_input::placeholder]:text-fg-error',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
})

export default UpgradeCreditCardFormFieldBlock
