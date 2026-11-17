import {type ReactNode, useState} from 'react'
import type {NotificationStatusEnum} from '../__generated__/NotificationDropdown_query.graphql'
import {cn} from '../ui/cn'

interface Props {
  avatar: string
  children: ReactNode
  isParabol: boolean
  status: NotificationStatusEnum
}

const NotificationRow = (props: Props) => {
  const {avatar, children, isParabol, status} = props
  const [initialStatus] = useState(status)
  const isClicked = initialStatus === 'CLICKED'
  const isNew = initialStatus === 'UNREAD'
  return (
    <div
      className={cn(
        'flex w-full cursor-default',
        !isClicked ? 'bg-surface-well' : 'bg-surface-card'
      )}
    >
      <img
        className={cn(
          'm-3 h-10 w-10 rounded-full bg-white',
          isParabol && 'border border-hairline-strong border-solid p-0.5'
        )}
        src={avatar}
      />
      {children}
      <div className='p-3'>
        <div className={cn('h-2 w-2 rounded-[10px] bg-rose-500', !isNew && 'invisible')} />
      </div>
    </div>
  )
}

export default NotificationRow
