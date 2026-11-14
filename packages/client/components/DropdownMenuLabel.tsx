import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import {cn} from '../ui/cn'

interface Props extends ComponentPropsWithoutRef<'div'> {
  isEmpty?: boolean
}

const DropdownMenuLabel = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {isEmpty, className, children, ...rest} = props
  return (
    <div
      ref={ref}
      className={cn(
        'select-none overflow-hidden text-ellipsis whitespace-nowrap border-hairline border-b px-4 py-0 font-semibold text-[15px] text-fg-primary leading-8',
        isEmpty ? '-mb-2' : 'mb-2',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
})

export default DropdownMenuLabel
