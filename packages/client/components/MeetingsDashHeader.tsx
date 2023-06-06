import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {UserTaskViewFilterLabels} from '../types/constEnums'
import lazyPreload from '../utils/lazyPreload'
import {MeetingsDashHeader_viewer$key} from '../__generated__/MeetingsDashHeader_viewer.graphql'
import DashSectionControls from './Dashboard/DashSectionControls'
import DashSectionHeader from './Dashboard/DashSectionHeader'
import DashFilterToggle from './DashFilterToggle/DashFilterToggle'
import {useUserTaskFilters} from '../utils/useUserTaskFilters'
import useAtmosphere from '../hooks/useAtmosphere'

const TeamFilterMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TeamFilterMenu' */
      './TeamFilterMenu'
    )
)

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
  } = useMenu(MenuPosition.UPPER_LEFT, {
    isDropdown: true
  })
  const teams = viewer?.teams ?? []
  const {teamIds} = useUserTaskFilters(viewerId)
  const teamFilter = useMemo(
    () => (teamIds ? teams.find(({id: teamId}) => teamIds.includes(teamId)) : undefined),
    [teamIds, teams]
  )

  const teamFilterName = (teamFilter && teamFilter.name) || UserTaskViewFilterLabels.ALL_TEAMS

  return (
    <DashSectionHeader>
      <DashSectionControls className='w-full flex-wrap justify-start overflow-visible'>
        <DashFilterToggle
          className='mt-4 mr-16 mb-4 ml-0 sidebar-left:mt-0 sidebar-left:mr-24 sidebar-left:mb-0 sidebar-left:ml-0'
          label='Team'
          onClick={teamFilterTogglePortal}
          onMouseEnter={TeamFilterMenu.preload}
          ref={teamFilterOriginRef}
          value={teamFilterName}
          iconText='group'
          dataCy='team-filter'
        />
        {teamFilterMenuPortal(<TeamFilterMenu menuProps={teamFilterMenuProps} viewer={viewer} />)}
      </DashSectionControls>
    </DashSectionHeader>
  )
}

export default MeetingsDashHeader
