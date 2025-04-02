import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {TeamDashTasksTab_viewer$key} from '~/__generated__/TeamDashTasksTab_viewer.graphql'
import DashFilterToggle from '~/components/DashFilterToggle/DashFilterToggle'
import DashNavControl from '../../../../components/DashNavControl/DashNavControl'
import DashSectionHeader from '../../../../components/Dashboard/DashSectionHeader'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useRouter from '../../../../hooks/useRouter'
import lazyPreload from '../../../../utils/lazyPreload'
import TeamColumnsContainer from '../../containers/TeamColumns/TeamColumnsContainer'

const TeamDashTeamMemberMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TeamDashTeamMemberMenu' */
      '../../../../components/TeamDashTeamMemberMenu'
    )
)

interface Props {
  viewerRef: TeamDashTasksTab_viewer$key
}

const TeamDashTasksTab = (props: Props) => {
  const {viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment TeamDashTasksTab_viewer on User {
        team(teamId: $teamId) {
          ...TeamDashTeamMemberMenu_team
          id
          name
          teamMemberFilter {
            user {
              preferredName
            }
          }
          teamMembers(sortBy: "preferredName") {
            id
          }
        }
        ...TeamColumnsContainer_viewer
      }
    `,
    viewerRef
  )

  const {history} = useRouter()
  const team = viewer.team!
  const {id: teamId, teamMembers, teamMemberFilter} = team

  const teamMemberFilterName =
    (teamMemberFilter && teamMemberFilter.user.preferredName) || 'All team members'
  const {togglePortal, menuProps, originRef, menuPortal} = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })

  return (
    <div className='flex h-full w-full'>
      <div className='relative flex h-full flex-1 flex-col overflow-auto'>
        <DashSectionHeader className='flex-row justify-between'>
          {/* Filter by Owner */}
          <div>
            {teamMembers.length > 1 && (
              <DashFilterToggle
                label='Team Member'
                onClick={togglePortal}
                onMouseEnter={TeamDashTeamMemberMenu.preload}
                ref={originRef}
                value={teamMemberFilterName}
              />
            )}
            {menuPortal(<TeamDashTeamMemberMenu menuProps={menuProps} team={team} />)}
          </div>
          {/* Archive Link */}
          <DashNavControl
            icon='archive'
            label='Archived Tasks'
            onClick={() => history.push(`/team/${teamId}/archive`)}
          />
        </DashSectionHeader>
        <div className='m-0 flex h-full min-h-0 w-full flex-1'>
          <TeamColumnsContainer viewer={viewer} />
        </div>
      </div>
    </div>
  )
}
export default TeamDashTasksTab
