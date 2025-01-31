import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {MeetingsDashHeader_viewer$key} from '../__generated__/MeetingsDashHeader_viewer.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {FilterLabels} from '../types/constEnums'
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

interface Props {
  viewerRef: MeetingsDashHeader_viewer$key | null | undefined
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
  const {teamIds} = useQueryParameterParser(viewerId)
  const teamFilter = useMemo(
    () => (teamIds ? teams.find(({id: teamId}) => teamIds.includes(teamId)) : undefined),
    [teamIds, teams]
  )

  const teamFilterName = (teamFilter && teamFilter.name) || FilterLabels.ALL_TEAMS

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
