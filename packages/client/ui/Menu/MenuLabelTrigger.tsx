import ExpandMore from '@mui/icons-material/ExpandMore'
import {forwardRef, type ReactNode} from 'react'

export const MenuLabelTrigger = forwardRef<HTMLDivElement, {children: ReactNode; icon?: ReactNode}>(
  (props, ref) => {
    const {children, icon, ...rest} = props
    return (
      <div
        {...rest}
        ref={ref}
        className='flex cursor-pointer items-center justify-between rounded-md bg-white'
      >
        <div className='p-2 leading-4'>{children}</div>
        {icon || (
          <ExpandMore className='text-slate-600 transition-transform in-data-[state=open]:rotate-180' />
        )}
      </div>
    )
  }
)
