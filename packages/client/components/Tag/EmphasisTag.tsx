import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'
import BaseTag from './BaseTag'

const EmphasisTag = forwardRef(
  (props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
    const {className, ...rest} = props
    return <BaseTag ref={ref} className={cn('bg-rose-500 text-white', className)} {...rest} />
  }
)

export default EmphasisTag
