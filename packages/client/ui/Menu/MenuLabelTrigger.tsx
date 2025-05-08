import ExpandMore from '@mui/icons-material/ExpandMore'
import {forwardRef, type ReactNode} from 'react'
import {cn} from '../cn'

export const MenuLabelTrigger = forwardRef<
  HTMLDivElement,
  {children: ReactNode; icon?: ReactNode; labelClassName?: string}
>((props, ref) => {
  const {children, icon, labelClassName, ...rest} = props
  return (
    <div
      {...rest}
      ref={ref}
      className='group flex cursor-pointer items-center justify-between rounded-md bg-white'
    >
      <div className={cn('p-2 leading-4', labelClassName)}>{children}</div>
      {icon || (
        <ExpandMore className='text-slate-600 transition-transform group-open:rotate-180 group-data-[state=open]:rotate-180' />
      )}
    </div>
  )
})
