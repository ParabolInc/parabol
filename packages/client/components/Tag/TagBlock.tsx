import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'

const TagBlock = forwardRef((props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
  const {className, ...rest} = props
  return (
    <div ref={ref} className={cn('inline-block h-4 align-middle leading-4', className)} {...rest} />
  )
})

export default TagBlock
