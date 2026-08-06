import {forwardRef, type HTMLAttributes, type Ref} from 'react'
import {cn} from '../ui/cn'

const ProviderActions = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, ...rest} = props
    return (
      <div
        {...rest}
        ref={ref}
        className={cn(
          'ml-auto flex sidebar-left:w-auto w-9 max-w-9 sidebar-left:max-w-40 flex-1 items-center justify-end pl-2 sidebar-left:pl-4',
          className
        )}
      />
    )
  }
)

export default ProviderActions
