import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import type {TimelineEventCard_timelineEvent$key} from '../__generated__/TimelineEventCard_timelineEvent.graphql'
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
    <div className='relative mb-4 flex w-full flex-col overflow-hidden rounded bg-surface-card shadow-[var(--shadow-card)]'>
      <div className='relative mx-4 mt-4 mb-2 flex justify-between'>
        <div className='flex'>
          <TimelineEventTypeIcon iconName={iconName} />
          {IconSVG}
          <div className='flex flex-col justify-around pt-0.5 pl-4 text-sm'>
            {title}
            <TimelineEventDate createdAt={createdAt} />
          </div>
        </div>
        {isActive &&
        (type === 'retroComplete' ||
          type === 'actionComplete' ||
          type === 'POKER_COMPLETE' ||
          type === 'TEAM_PROMPT_COMPLETE') ? (
          <TimelineEventHeaderMenuToggle timelineEventId={timelineEventId} />
        ) : null}
      </div>
      {children}
    </div>
  )
}

export default TimelineEventCard
