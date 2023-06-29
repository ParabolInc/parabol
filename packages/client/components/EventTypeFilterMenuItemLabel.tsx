import React from 'react'
import {timelineEventTypeMenuIcons, timelineEventTypeMenuLabels} from '../utils/constants'
import TimelineEventTypeIcon from './TimelineEventTypeIcon'
import MenuItemLabel from './MenuItemLabel'
import {FilterLabels} from '../types/constEnums'

interface Props {
  eventType?: string
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
        <TimelineEventTypeIcon iconName={eventTypeIconName} />
      </span>
      <MenuItemLabel>{eventTypeLabel}</MenuItemLabel>
    </>
  )
}

export default EventTypeFilterMenuItemLabel
