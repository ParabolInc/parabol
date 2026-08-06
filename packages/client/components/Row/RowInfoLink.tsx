import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'

const RowInfoLink = forwardRef(
  (props: ComponentPropsWithoutRef<'a'>, ref: Ref<HTMLAnchorElement>) => {
    const {className, ...rest} = props
    return (
      <a
        ref={ref}
        className={cn(
          'text-[13px] text-fg-secondary leading-[18px] hover:text-fg-secondary hover:underline focus:text-fg-secondary focus:underline active:text-fg-secondary active:underline',
          className
        )}
        {...rest}
      />
    )
  }
)

export default RowInfoLink
