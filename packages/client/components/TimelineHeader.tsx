import React from 'react'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {FilterLabels} from '../types/constEnums'
import lazyPreload from '../utils/lazyPreload'
import DashSectionControls from './Dashboard/DashSectionControls'
import DashSectionHeader from './Dashboard/DashSectionHeader'
import DashFilterToggle from './DashFilterToggle/DashFilterToggle'
import {useQueryParameterParser} from '../utils/useQueryParameterParser'
import useAtmosphere from '../hooks/useAtmosphere'
import {timelineEventTypeMenuLabels} from '../utils/constants'

const TimelineEventTypeMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TimelineEventTypeMenu' */
      './TimelineEventTypeMenu'
    )
)

const TimelineHeader = () => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const {
    menuPortal: timelineEventTypeFilterMenuPortal,
    togglePortal: timelineEventTypeFilterTogglePortal,
    originRef: timelineEventTypeFilterOriginRef,
    menuProps: timelineEventTypeFilterMenuProps
  } = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  const {eventTypes} = useQueryParameterParser(viewerId)
  const eventTypeFilterName =
    eventTypes && eventTypes.length > 0
      ? timelineEventTypeMenuLabels[eventTypes[0]!]!
      : FilterLabels.ALL_EVENTS

  return (
    <DashSectionHeader>
      <DashSectionControls className='w-full flex-wrap justify-start overflow-visible'>
        <DashFilterToggle
          className='mt-4 mr-16 mb-4 ml-0 sidebar-left:mt-0 sidebar-left:mr-24 sidebar-left:mb-0 sidebar-left:ml-0'
          label='Event Type'
          onClick={timelineEventTypeFilterTogglePortal}
          onMouseEnter={TimelineEventTypeMenu.preload}
          ref={timelineEventTypeFilterOriginRef}
          value={eventTypeFilterName}
        />
        {timelineEventTypeFilterMenuPortal(
          <TimelineEventTypeMenu menuProps={timelineEventTypeFilterMenuProps} />
        )}
      </DashSectionControls>
    </DashSectionHeader>
  )
}

export default TimelineHeader
