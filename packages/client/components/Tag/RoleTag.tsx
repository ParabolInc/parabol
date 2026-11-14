import {type ComponentPropsWithoutRef, forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'
import BaseTag from './BaseTag'

const RoleTag = forwardRef((props: ComponentPropsWithoutRef<'div'>, ref: Ref<HTMLDivElement>) => {
  const {className, ...rest} = props
  return <BaseTag ref={ref} className={cn('bg-grape-700 text-white', className)} {...rest} />
})

export default RoleTag
