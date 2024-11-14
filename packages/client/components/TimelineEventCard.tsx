import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {TimelineEventCard_timelineEvent$key} from '../__generated__/TimelineEventCard_timelineEvent.graphql'
import {cardShadow} from '../styles/elevation'
import TimelineEventDate from './TimelineEventDate'
import TimelineEventHeaderMenuToggle from './TimelineEventHeaderMenuToggle'
import TimelineEventTypeIcon from './TimelineEventTypeIcon'

interface Props {
  children: ReactNode
  //FIXME 6062: change to React.ComponentType
  iconName?: string
  IconSVG?: ReactNode
  title: ReactNode
  timelineEvent: TimelineEventCard_timelineEvent$key
}

const Surface = styled('div')({
  background: '#FFFFFF',
  borderRadius: 4,
  boxShadow: cardShadow,
  display: 'flex',
  flexDirection: 'column',
  marginBottom: 16,
  overflow: 'hidden',
  position: 'relative',
  width: '100%'
})

const CardHeader = styled('div')({
  display: 'flex',
  margin: '16px 16px 8px',
  position: 'relative',
  justifyContent: 'space-between'
})

const CardTitleBlock = styled('div')({
  display: 'flex'
})

const HeaderText = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  fontSize: 14,
  justifyContent: 'space-around',
  lineHeight: '20px',
  paddingLeft: 16,
  paddingTop: 2
})

const TimelineEventCard = (props: Props) => {
  const {children, iconName, IconSVG, title, timelineEvent: timelineEventRef} = props
  const timelineEvent = useFragment(
    graphql`
      fragment TimelineEventCard_timelineEvent on TimelineEvent {
        id
        createdAt
        type
        isActive
      }
    `,
    timelineEventRef
  )
  const {id: timelineEventId, createdAt, type, isActive} = timelineEvent
  return (
    <Surface>
      <CardHeader>
        <CardTitleBlock>
          <TimelineEventTypeIcon iconName={iconName} />
          {IconSVG}
          <HeaderText>
            {title}
            <TimelineEventDate createdAt={createdAt} />
          </HeaderText>
        </CardTitleBlock>
        {isActive &&
        (type === 'retroComplete' ||
          type === 'actionComplete' ||
          type === 'POKER_COMPLETE' ||
          type === 'TEAM_PROMPT_COMPLETE') ? (
          <TimelineEventHeaderMenuToggle timelineEventId={timelineEventId} />
        ) : null}
      </CardHeader>
      {children}
    </Surface>
  )
}

export default TimelineEventCard
