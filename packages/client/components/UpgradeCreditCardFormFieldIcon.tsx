import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../ui/cn'

interface Props extends ComponentPropsWithoutRef<'div'> {
  hasError: boolean
}

const UpgradeCreditCardFormFieldIcon = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {className, children, hasError, ...rest} = props
  return (
    <div
      ref={ref}
      className={cn(
        'block h-6 w-6 pl-2 text-center opacity-50 [&_svg]:text-[18px]',
        hasError ? 'text-fg-error' : 'text-fg-secondary',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
})

export default UpgradeCreditCardFormFieldIcon
