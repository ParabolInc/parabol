import {HelpOutline, Notifications, Search} from '@mui/icons-material'
import {type ComponentPropsWithoutRef, forwardRef} from 'react'
import PlainButton from './PlainButton/PlainButton'

interface Props extends ComponentPropsWithoutRef<'button'> {
  //FIXME 6062: change to React.ComponentType
  icon: string
  hasBadge?: boolean
  ariaLabel: string
}

const TopBarIcon = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const {icon, hasBadge, ariaLabel, ...rest} = props
  return (
    <PlainButton
      {...rest}
      ref={ref}
      aria-label={ariaLabel}
      className='relative mx-1 my-2 flex cursor-pointer justify-center rounded-md p-1 focus:shadow-[0_0_0_2px_var(--color-sky-400)] active:shadow-[0_0_0_2px_transparent]'
    >
      <div className='h-6 w-6'>
        {
          {
            search: <Search />,
            help_outline: <HelpOutline />,
            notifications: <Notifications />
          }[icon]
        }
      </div>
      {/* badge is 9x9: 8px dot +1 for borders */}
      {hasBadge && (
        <div className='absolute top-[5px] left-[18px] h-[9px] w-[9px] rounded-[10px] border border-(--color-surface-topbar) bg-rose-500' />
      )}
    </PlainButton>
  )
})

export default TopBarIcon
