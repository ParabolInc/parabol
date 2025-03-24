import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import toTeamMemberId from '~/utils/relay/toTeamMemberId'
import {useQueryParameterParser} from '~/utils/useQueryParameterParser'
import {UserColumnsContainer_viewer$key} from '../../../../__generated__/UserColumnsContainer_viewer.graphql'
import TaskColumns from '../../../../components/TaskColumns/TaskColumns'
import getSafeRegex from '../../../../utils/getSafeRegex'

interface Props {
  viewerRef: UserColumnsContainer_viewer$key
}

const UserColumnsContainer = (props: Props) => {
  const {viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment UserColumnsContainer_viewer on User {
        id
        dashSearch
        teams {
          id
          teamMembers(sortBy: "preferredName") {
            userId
          }
          ...TaskColumns_teams
        }
        tasks(first: 1000, after: $after, userIds: $userIds, teamIds: $teamIds)
          @connection(key: "UserColumnsContainer_tasks", filters: ["userIds", "teamIds"]) {
          edges {
            node {
              ...TaskColumns_tasks
              # grab these so we can sort correctly
              id
              content
              plaintextContent
              status
              sortOrder
              teamId
              userId
            }
          }
        }
      }
    `,
    viewerRef
  )
  const {userIds, teamIds} = useQueryParameterParser(viewer.id)
  const {dashSearch, tasks, teams} = viewer
  const filteredTasks = useMemo(() => {
    const dashSearchRegex = getSafeRegex(dashSearch, 'i')
    const nodes = tasks.edges.map(({node}) => node)
    const dashSearchNodes = dashSearch
      ? nodes.filter((task) => {
          return task.plaintextContent?.match(dashSearchRegex)
        })
      : nodes

    const teamFilteredNodes = dashSearchNodes.filter((node) =>
      teamIds ? teamIds.includes(node.teamId) : true
    )
    const teamMemberFilteredNodes = teamFilteredNodes.filter((node) =>
      userIds && node.userId ? userIds.includes(node.userId) : true
    )

    return teamMemberFilteredNodes.map((node) => ({
      ...node
    }))
  }, [teamIds, userIds, tasks, dashSearch])
  // iff 1 user is selected, we show team names at the footer; otherwise we show task owner name
  const areaForTaskCard = userIds && userIds.length === 1 ? 'userDash' : 'teamDash'
  const filteredTeams = userIds
    ? teams.filter(({teamMembers, id: teamId}) => {
        const inTeam = !!teamMembers.find(({userId}) => userIds.includes(userId))
        const teamFiltered = teamIds ? teamIds.includes(teamId) : true
        return teamFiltered && inTeam
      })
    : teamIds
      ? teams.filter(({id}) => teamIds.includes(id))
      : teams

  const firstTeam = filteredTeams[0]
  if (firstTeam) {
    return (
      <TaskColumns
        area={areaForTaskCard}
        tasks={filteredTasks}
        myTeamMemberId={toTeamMemberId(firstTeam.id, userIds ? userIds[0]! : viewer.id)}
        teams={filteredTeams}
      />
    )
  } else {
    return null
  }
}

export default UserColumnsContainer
