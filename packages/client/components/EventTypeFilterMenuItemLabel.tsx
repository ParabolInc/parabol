import React from 'react'
import {
  CUSTOMIZED_SVG,
  timelineEventTypeMenuIcons,
  timelineEventTypeMenuLabels
} from '../utils/constants'
import TimelineEventTypeIcon from './TimelineEventTypeIcon'
import MenuItemLabel from './MenuItemLabel'
import {FilterLabels} from '../types/constEnums'
import {TimelineEventEnum} from '../__generated__/MyDashboardTimelineQuery.graphql'
import CardsSVG from './CardsSVG'

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
      <span className='py-1 pl-4'>
        {/* Update here if there are more customized SVGs than CardsSVG to display */}
        {eventTypeIconName === CUSTOMIZED_SVG ? (
          <CardsSVG />
        ) : (
          <TimelineEventTypeIcon iconName={eventTypeIconName} />
        )}
      </span>
      <MenuItemLabel>{eventTypeLabel}</MenuItemLabel>
    </>
  )
}

export default EventTypeFilterMenuItemLabel
