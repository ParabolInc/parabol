import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {TimelineHeader_viewer$key} from '../__generated__/TimelineHeader_viewer.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {FilterLabels} from '../types/constEnums'
import {timelineEventTypeMenuLabels} from '../utils/constants'
import lazyPreload from '../utils/lazyPreload'
import {useQueryParameterParser} from '../utils/useQueryParameterParser'
import DashFilterToggle from './DashFilterToggle/DashFilterToggle'
import DashSectionControls from './Dashboard/DashSectionControls'
import DashSectionHeader from './Dashboard/DashSectionHeader'

const TeamFilterMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TeamFilterMenu' */
      './TeamFilterMenu'
    )
)

const TimelineEventTypeMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TimelineEventTypeMenu' */
      './TimelineEventTypeMenu'
    )
)

interface Props {
  viewerRef: TimelineHeader_viewer$key | null
}

const TimelineHeader = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment TimelineHeader_viewer on User {
        id
        ...TeamFilterMenu_viewer
        teams {
          id
          name
        }
      }
    `,
    viewerRef
  )

  const {
    menuPortal: teamFilterMenuPortal,
    togglePortal: teamFilterTogglePortal,
    originRef: teamFilterOriginRef,
    menuProps: teamFilterMenuProps
  } = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  const teams = viewer?.teams ?? []
  const {teamIds} = useQueryParameterParser(viewerId)
  const teamFilter = useMemo(
    () => (teamIds ? teams.find(({id: teamId}) => teamIds.includes(teamId)) : undefined),
    [teamIds, teams]
  )
  const teamFilterName = (teamFilter && teamFilter.name) || FilterLabels.ALL_TEAMS
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
          className='mt-4 mr-16 mb-4 ml-0 sidebar-left:mt-0 sidebar-left:mr-6 sidebar-left:mb-0 sidebar-left:ml-0'
          label='Team'
          onClick={teamFilterTogglePortal}
          onMouseEnter={TeamFilterMenu.preload}
          ref={teamFilterOriginRef}
          value={teamFilterName}
          iconText='group'
        />
        {teamFilterMenuPortal(<TeamFilterMenu menuProps={teamFilterMenuProps} viewer={viewer} />)}
        <DashFilterToggle
          className='mt-4 mr-16 mb-4 ml-0 sidebar-left:mt-0 sidebar-left:mr-6 sidebar-left:mb-0 sidebar-left:ml-0'
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
