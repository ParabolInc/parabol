import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'

const PokerVotingRowBase = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, ...rest} = props
    return (
      <div
        {...rest}
        ref={ref}
        className={cn('flex min-h-14 shrink-0 items-center py-[5px] pr-0 pl-4', className)}
      />
    )
  }
)

export default PokerVotingRowBase
