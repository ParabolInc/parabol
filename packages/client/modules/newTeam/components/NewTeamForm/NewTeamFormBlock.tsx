import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../../../../ui/cn'

const NewTeamFormBlock = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, ...rest} = props
    return (
      <div
        {...rest}
        ref={ref}
        className={cn(
          'mx-auto mb-4 sidebar-left:flex w-full sidebar-left:items-start sidebar-left:justify-between',
          className
        )}
      />
    )
  }
)

export default NewTeamFormBlock
