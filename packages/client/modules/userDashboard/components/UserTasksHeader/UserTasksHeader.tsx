import graphql from 'babel-plugin-relay/macro'
import {Suspense, useMemo, useRef} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {
  UserTasksHeader_viewer$data,
  UserTasksHeader_viewer$key
} from '~/__generated__/UserTasksHeader_viewer.graphql'
import Checkbox from '~/components/Checkbox'
import {FilterLabels} from '~/types/constEnums'
import {Button} from '~/ui/Button/Button'
import constructFilterQueryParamURL from '~/utils/constructFilterQueryParamURL'
import {useQueryParameterParser} from '~/utils/useQueryParameterParser'
import DashSectionControls from '../../../../components/Dashboard/DashSectionControls'
import DashSectionHeader from '../../../../components/Dashboard/DashSectionHeader'
import DashFilterToggle from '../../../../components/DashFilterToggle/DashFilterToggle'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {Menu} from '../../../../ui/Menu/Menu'
import lazyPreload from '../../../../utils/lazyPreload'

const TeamFilterMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TeamFilterMenu' */
      '../../../../components/TeamFilterMenu'
    )
)

const UserDashTeamMemberMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'UserDashTeamMemberMenu' */
      '../../../../components/UserDashTeamMemberMenu'
    )
)

interface Props {
  viewerRef: UserTasksHeader_viewer$key | null
}

const UserTasksHeader = (props: Props) => {
  const navigate = useNavigate()
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment UserTasksHeader_viewer on User {
        id
        ...TeamFilterMenu_viewer
        ...UserDashTeamMemberMenu_viewer
        teams {
          id
          name
          teamMembers(sortBy: "preferredName") {
            user {
              id
              preferredName
              tms
            }
          }
        }
      }
    `,
    viewerRef
  )
  const oldTeamsRef = useRef<UserTasksHeader_viewer$data['teams']>([])
  const nextTeams = viewer?.teams ?? oldTeamsRef.current
  if (nextTeams) {
    oldTeamsRef.current = nextTeams
  }
  const teams = oldTeamsRef.current
  const {userIds, teamIds, showArchived} = useQueryParameterParser(viewerId)

  const teamFilter = useMemo(
    () => (teamIds ? teams.find(({id: teamId}) => teamIds.includes(teamId)) : undefined),
    [teamIds, teams]
  )

  const teamFilterName = (teamFilter && teamFilter.name) || FilterLabels.ALL_TEAMS

  const teamMemberFilterName = useMemo(() => {
    const teamMembers = teams.flatMap(({teamMembers}) => teamMembers)
    const users = teamMembers.filter(Boolean).flatMap(({user}) => user)
    const keySet = new Set()
    const dedupedUsers = [] as {
      id: string
      preferredName: string
      tms: ReadonlyArray<string>
    }[]
    users.forEach((user) => {
      const userKey = user.id
      if (!keySet.has(userKey)) {
        keySet.add(userKey)
        dedupedUsers.push(user)
      }
    })
    const teamMemberFilter = userIds
      ? dedupedUsers.find(({id: userId}) => userIds.includes(userId))
      : undefined
    return teamFilter && teamMemberFilter
      ? teamMemberFilter.tms.includes(teamFilter.id)
        ? teamMemberFilter.preferredName
        : FilterLabels.ALL_TEAM_MEMBERS
      : (teamMemberFilter?.preferredName ?? FilterLabels.ALL_TEAM_MEMBERS)
  }, [teamIds, userIds, teams])

  return (
    <DashSectionHeader>
      <DashSectionControls className='w-full flex-wrap justify-start overflow-visible'>
        <Menu
          trigger={
            <DashFilterToggle
              className='my-1 sidebar-left:my-0 mr-4 sidebar-left:mr-6 ml-0 sidebar-left:ml-0'
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

        {/* Filter by Owner */}
        <Menu
          trigger={
            <DashFilterToggle
              className='my-1 sidebar-left:my-0 mr-4 sidebar-left:mr-6 ml-0 sidebar-left:ml-0'
              label='Team Member'
              onMouseEnter={UserDashTeamMemberMenu.preload}
              value={teamMemberFilterName}
              iconText='person'
              dataCy='team-member-filter'
            />
          }
        >
          <Suspense fallback={null}>
            <UserDashTeamMemberMenu viewer={viewer} />
          </Suspense>
        </Menu>

        <Button
          size='default'
          className='my-1 sidebar-left:my-0 shrink-0 bg-transparent p-0 font-semibold text-[14px] text-fg-secondary leading-5 shadow-none hover:text-fg-primary focus:text-fg-primary active:text-fg-primary'
          onClick={() => navigate(constructFilterQueryParamURL(teamIds, userIds, !showArchived))}
          data-cy='archived-checkbox'
        >
          <Checkbox className='mr-2 w-6 text-center text-[24px]' active={showArchived} />
          {'Archived'}
        </Button>
      </DashSectionControls>
    </DashSectionHeader>
  )
}

export default UserTasksHeader
