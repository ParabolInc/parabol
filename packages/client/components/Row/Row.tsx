import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'

const Row = forwardRef((props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
  const {className, ...rest} = props
  return (
    <div
      ref={ref}
      className={cn(
        'flex w-full flex-wrap items-center justify-between border-hairline border-t p-4',
        className
      )}
      {...rest}
    />
  )
})

export default Row
