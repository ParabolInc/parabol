import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo, useRef} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {Breakpoint, UserTaskViewFilterLabels} from '../types/constEnums'
import lazyPreload from '../utils/lazyPreload'
import makeMinWidthMediaQuery from '../utils/makeMinWidthMediaQuery'
import {useUserTaskFilters} from '../utils/useUserTaskFilters'
import {
  MeetingsDashHeader_viewer,
  MeetingsDashHeader_viewer$key
} from '../__generated__/MeetingsDashHeader_viewer.graphql'
import DashSectionControls from './Dashboard/DashSectionControls'
import DashSectionHeader from './Dashboard/DashSectionHeader'
import DashFilterToggle from './DashFilterToggle/DashFilterToggle'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

const UserDashTeamMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'UserDashTeamMenu' */
      './UserDashTeamMenu'
    )
)

const StyledDashFilterToggle = styled(DashFilterToggle)({
  margin: '4px 16px 4px 0',
  [desktopBreakpoint]: {
    margin: '0 24px 0 0'
  }
})

const MeetingsDashHeaderDashSectionControls = styled(DashSectionControls)({
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
  width: '100%',
  overflow: 'initial'
})

interface Props {
  viewerRef: MeetingsDashHeader_viewer$key | null
}

const MeetingsDashHeader = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment MeetingsDashHeader_viewer on User {
        id
        ...UserDashTeamMenu_viewer
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
  const oldTeamsRef = useRef<MeetingsDashHeader_viewer['teams']>([])
  const nextTeams = viewer?.teams ?? oldTeamsRef.current
  if (nextTeams) {
    oldTeamsRef.current = nextTeams
  }
  const teams = oldTeamsRef.current
  const {teamIds} = useUserTaskFilters(viewerId)

  const teamFilter = useMemo(
    () => (teamIds ? teams.find(({id: teamId}) => teamIds.includes(teamId)) : undefined),
    [teamIds, teams]
  )

  const teamFilterName = (teamFilter && teamFilter.name) || UserTaskViewFilterLabels.ALL_TEAMS

  return (
    <DashSectionHeader>
      <MeetingsDashHeaderDashSectionControls>
        <StyledDashFilterToggle
          label='Team'
          onClick={teamFilterTogglePortal}
          onMouseEnter={UserDashTeamMenu.preload}
          ref={teamFilterOriginRef}
          value={teamFilterName}
          iconText='group'
          dataCy='team-filter'
        />
        {teamFilterMenuPortal(<UserDashTeamMenu menuProps={teamFilterMenuProps} viewer={viewer} />)}
      </MeetingsDashHeaderDashSectionControls>
    </DashSectionHeader>
  )
}

export default MeetingsDashHeader
