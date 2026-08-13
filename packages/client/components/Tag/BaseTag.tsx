import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'

const BaseTag = forwardRef((props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
  const {className, ...rest} = props
  return (
    <div
      ref={ref}
      className={cn(
        'ml-2 h-4 select-none rounded-[4em] px-2 text-center font-semibold text-[11px] leading-4',
        className
      )}
      {...rest}
    />
  )
})

export default BaseTag
