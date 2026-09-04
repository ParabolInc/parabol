import type {TimelineEventEnum} from '../__generated__/MyDashboardTimelineQuery.graphql'
import {FilterLabels} from '../types/constEnums'
import {
  CUSTOMIZED_SVG,
  timelineEventTypeMenuIcons,
  timelineEventTypeMenuLabels
} from '../utils/constants'
import CardsSVG from './CardsSVG'
import TimelineEventTypeIcon from './TimelineEventTypeIcon'

interface Props {
  eventType?: TimelineEventEnum
}

const EventTypeFilterMenuItemLabel = (props: Props) => {
  const {eventType} = props
  const eventTypeLabel = eventType
    ? timelineEventTypeMenuLabels[eventType]
    : FilterLabels.ALL_EVENTS
  const eventTypeIconName = eventType ? timelineEventTypeMenuIcons[eventType] : 'timeline'
  return (
    <>
      <span className='flex items-center'>
        {/* Update here if there are more customized SVGs than CardsSVG to display */}
        {eventTypeIconName === CUSTOMIZED_SVG ? (
          <CardsSVG />
        ) : (
          <TimelineEventTypeIcon iconName={eventTypeIconName} />
        )}
      </span>
      <span className='pl-2'>{eventTypeLabel}</span>
    </>
  )
}

export default EventTypeFilterMenuItemLabel
