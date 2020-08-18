import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import TaskColumns from '../../../../components/TaskColumns/TaskColumns'
import {UserColumnsContainer_viewer} from '../../../../__generated__/UserColumnsContainer_viewer.graphql'
import {AreaEnum} from '../../../../types/graphql'
import getSafeRegex from '../../../../utils/getSafeRegex'
import toTeamMemberId from '~/utils/relay/toTeamMemberId'

interface Props {
  viewer: UserColumnsContainer_viewer
}

const UserColumnsContainer = (props: Props) => {
  const {viewer} = props
  const {dashSearch, tasks, teamFilter, teamMemberFilter} = viewer
  const teamFilterId = (teamFilter && teamFilter.id) || null
  const userFilterId = (teamMemberFilter && teamMemberFilter.id) || null
  const filteredTasks = useMemo(() => {
    const dashSearchRegex = getSafeRegex(dashSearch, 'i')
    const nodes = tasks.edges.map(({node}) => node)
    const dashSearchNodes = dashSearch
      ? nodes.filter((task) => {
        return task.contentText && task.contentText.match(dashSearchRegex)
      })
      : nodes

    const teamFilteredNodes = teamFilterId
      ? dashSearchNodes.filter((node) => node.teamId === teamFilterId)
      : dashSearchNodes

    const teamMemberFilteredNodes = userFilterId
      ? teamFilteredNodes.filter((node) => {
        return node.userId === userFilterId
      })
      : teamFilteredNodes

    return teamMemberFilteredNodes.map((node) => ({
      ...node
    }))
  }, [teamFilterId, userFilterId, tasks, dashSearch])
  {
    const {
      viewer: {teams}
    } = props

    // if user filter is selected, it's like User Dashboard: task footer shows team name
    const areaForTaskCard = teamMemberFilter ? AreaEnum.userDash : AreaEnum.teamDash
    const myTeamMemberId = teamFilter ? toTeamMemberId(teamFilter!.id, viewer.id) : undefined
    const filteredTeams = teamFilter ? [teamFilter] : teams

    return <TaskColumns area={areaForTaskCard} tasks={filteredTasks} myTeamMemberId={myTeamMemberId} teams={filteredTeams} />
  }
}

export default createFragmentContainer(UserColumnsContainer, {
  viewer: graphql`
    fragment UserColumnsContainer_viewer on User {
      id
      dashSearch
      teamFilter {
        id
        ...TaskColumns_teams
      }
      teamMemberFilter {
        id
      }
      teams {
        ...TaskColumns_teams
      }
      tasks(first: 1000) @connection(key: "UserColumnsContainer_tasks") {
        edges {
          node {
            ...TaskColumns_tasks
            # grab these so we can sort correctly
            id
            content @__clientField(handle: "contentText")
            contentText
            status
            sortOrder
            teamId
            userId
          }
        }
      }
    }
  `
})
