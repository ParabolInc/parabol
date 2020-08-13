import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import TaskColumns from '../../../../components/TaskColumns/TaskColumns'
import {AreaEnum} from '../../../../types/graphql'
import getSafeRegex from '../../../../utils/getSafeRegex'
import {UserColumnsContainer_viewer} from '../../../../__generated__/UserColumnsContainer_viewer.graphql'

interface Props {
  viewer: UserColumnsContainer_viewer
}

const UserColumnsContainer = (props: Props) => {
  const {viewer} = props
  const {dashSearch, tasks, teamFilter} = viewer
  const teamFilterId = (teamFilter && teamFilter.id) || null
  const filteredTasks = useMemo(() => {
    const dashSearchRegex = getSafeRegex(dashSearch, 'i')
    const nodes = tasks.edges.map(({node}) => node)
    const dashSearchNodes = dashSearch
      ? nodes.filter((task) => {
        return task.contentText && task.contentText.match(dashSearchRegex)
      })
      : nodes

    const teamFilteredNodes = teamFilterId
      ? dashSearchNodes.filter((node) => node.team.id === teamFilterId)
      : dashSearchNodes

    return teamFilteredNodes.map((node) => ({
      ...node
    }))
  }, [teamFilterId, tasks, dashSearch])
  {
    const {
      viewer: {teams}
    } = props

    return <TaskColumns area={AreaEnum.userDash} tasks={filteredTasks} teams={teams} />
  }
}

export default createFragmentContainer(UserColumnsContainer, {
  viewer: graphql`
    fragment UserColumnsContainer_viewer on User {
      dashSearch
      teamFilter {
        id
      }
      teams {
        ...TaskColumns_teams
      }
      tasks(first: 1000, userIds: $userIds) @connection(key: "UserColumnsContainer_tasks") {
        edges {
          node {
            ...TaskColumns_tasks
            # grab these so we can sort correctly
            id
            content @__clientField(handle: "contentText")
            contentText
            status
            sortOrder
            team {
              id
            }
          }
        }
      }
    }
  `
})
