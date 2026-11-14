import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'

const StyledTip = forwardRef((props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
  const {className, ...rest} = props
  return (
    <div {...rest} ref={ref} className={cn('text-center font-semibold text-jade-400', className)} />
  )
})

export default StyledTip
