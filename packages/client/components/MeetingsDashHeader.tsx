import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {Breakpoint, UserTaskViewFilterLabels} from '../types/constEnums'
import lazyPreload from '../utils/lazyPreload'
import makeMinWidthMediaQuery from '../utils/makeMinWidthMediaQuery'
import {MeetingsDashHeader_viewer$key} from '../__generated__/MeetingsDashHeader_viewer.graphql'
import DashSectionControls from './Dashboard/DashSectionControls'
import DashSectionHeader from './Dashboard/DashSectionHeader'
import DashFilterToggle from './DashFilterToggle/DashFilterToggle'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

const MeetingsDashTeamMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'MeetingsDashTeamMenu' */
      './MeetingsDashTeamMenu'
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
  const {viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment MeetingsDashHeader_viewer on User {
        id
        teamFilter {
          id
          name
        }
        ...MeetingsDashTeamMenu_viewer
        teams {
          id
          name
        }
      }
    `,
    viewerRef
  )
  const teamFilter = viewer?.teamFilter ?? null
  const {
    menuPortal: teamFilterMenuPortal,
    togglePortal: teamFilterTogglePortal,
    originRef: teamFilterOriginRef,
    menuProps: teamFilterMenuProps
  } = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })

  const teamFilterName = (teamFilter && teamFilter.name) || UserTaskViewFilterLabels.ALL_TEAMS

  return (
    <DashSectionHeader>
      <MeetingsDashHeaderDashSectionControls>
        <StyledDashFilterToggle
          label='Team'
          onClick={teamFilterTogglePortal}
          onMouseEnter={MeetingsDashTeamMenu.preload}
          ref={teamFilterOriginRef}
          value={teamFilterName}
          iconText='group'
          dataCy='team-filter'
        />
        {teamFilterMenuPortal(
          <MeetingsDashTeamMenu menuProps={teamFilterMenuProps} viewer={viewer} />
        )}
      </MeetingsDashHeaderDashSectionControls>
    </DashSectionHeader>
  )
}

export default MeetingsDashHeader
