import ExpandMore from '@mui/icons-material/ExpandMore'
import {forwardRef, type ReactNode} from 'react'
import {cn} from '../cn'

export const MenuLabelTrigger = forwardRef<
  HTMLDivElement,
  {children: ReactNode; icon?: ReactNode; className?: string; labelClassName?: string}
>((props, ref) => {
  const {children, icon, labelClassName, className, ...rest} = props
  return (
    <div
      {...rest}
      ref={ref}
      className={cn(
        'group flex cursor-pointer items-center justify-between rounded-md bg-surface-card px-2',
        className
      )}
    >
      <div className={cn('p-2 leading-4', labelClassName)}>{children}</div>
      {icon || (
        <ExpandMore className='text-fg-secondary transition-transform group-open:rotate-180 group-data-[state=open]:rotate-180' />
      )}
    </div>
  )
})
