import graphql from 'babel-plugin-relay/macro'
import {Suspense, useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {MeetingsDashHeader_viewer$key} from '../__generated__/MeetingsDashHeader_viewer.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {FilterLabels} from '../types/constEnums'
import {Menu} from '../ui/Menu/Menu'
import lazyPreload from '../utils/lazyPreload'
import {useQueryParameterParser} from '../utils/useQueryParameterParser'
import DashSectionControls from './Dashboard/DashSectionControls'
import DashSectionHeader from './Dashboard/DashSectionHeader'
import DashFilterToggle from './DashFilterToggle/DashFilterToggle'

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
        <Menu
          trigger={
            <DashFilterToggle
              className='mt-4 sidebar-left:mt-0 mr-16 sidebar-left:mr-24 mb-4 sidebar-left:mb-0 ml-0 sidebar-left:ml-0'
              label='Team'
              onMouseEnter={TeamFilterMenu.preload}
              value={teamFilterName}
              iconText='group'
              dataCy='team-filter'
            />
          }
        >
          <Suspense fallback={null}>
            <TeamFilterMenu viewer={viewer} />
          </Suspense>
        </Menu>
      </DashSectionControls>
    </DashSectionHeader>
  )
}

export default MeetingsDashHeader
