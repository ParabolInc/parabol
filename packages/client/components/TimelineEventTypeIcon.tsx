import {
  AccountCircle,
  ChangeHistory,
  GroupAdd,
  GroupWork,
  History,
  Lock,
  Style,
  Timeline
} from '~/ui/icons'

interface Props {
  iconName?: string
}

const TimelineEventTypeIcon = (props: Props) => {
  const {iconName} = props
  if (!iconName) return null
  return (
    <div className='block h-6 w-6 select-none self-start rounded-sm text-fg-secondary'>
      {
        {
          change_history: <ChangeHistory />,
          history: <History />,
          account_circle: <AccountCircle />,
          group_add: <GroupAdd />,
          group_work: <GroupWork />,
          lock: <Lock className='text-grape-500' />,
          style: <Style />,
          timeline: <Timeline />
        }[iconName]
      }
    </div>
  )
}

export default TimelineEventTypeIcon
