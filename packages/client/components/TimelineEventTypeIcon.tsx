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
import React from 'react'

interface Props {
  iconName?: string
}

const EventIcon = styled('div')({
  alignSelf: 'flex-start',
  borderRadius: '100%',
  color: PALETTE.SLATE_600,
  display: 'block',
  height: 24,
  userSelect: 'none',
  width: 24
})

const GrapeLock = styled(Lock)({
  color: PALETTE.GRAPE_500
})

const TimelineEventTypeIcon = (props: Props) => {
  const {iconName} = props
  if (!iconName) return null
  return (
    <EventIcon>
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
    </EventIcon>
  )
}

export default TimelineEventTypeIcon
