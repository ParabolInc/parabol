import styled from '@emotion/styled'
import {
  AccountCircle,
  ChangeHistory,
  GroupAdd,
  GroupWork,
  History,
  Lock,
  Style,
  Timeline
} from '@mui/icons-material'
import {PALETTE} from '../styles/paletteV3'

interface Props {
  iconName?: string
}

const GrapeLock = styled(Lock)({
  color: PALETTE.GRAPE_500
})

const TimelineEventTypeIcon = (props: Props) => {
  const {iconName} = props
  if (!iconName) return null
  return (
    <div className='block h-6 w-6 self-start rounded-sm text-slate-600 select-none'>
      {
        {
          change_history: <ChangeHistory />,
          history: <History />,
          account_circle: <AccountCircle />,
          group_add: <GroupAdd />,
          group_work: <GroupWork />,
          lock: <GrapeLock />,
          style: <Style />,
          timeline: <Timeline />
        }[iconName]
      }
    </div>
  )
}

export default TimelineEventTypeIcon
